import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MINUTES } from "@/lib/constants";
import type { AccountType } from "@/generated/prisma";

class AccountLockedError extends CredentialsSignin {
  code = "account-locked";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;
        if (user.isSuspended) return null;

        // Time-based lockout: after MAX_LOGIN_ATTEMPTS the account is locked for
        // LOCKOUT_DURATION_MINUTES, then auto-unlocks. This prevents a permanent
        // lockout DoS while still throttling brute-force attempts.
        if (user.lockedAt) {
          const unlockAt = user.lockedAt.getTime() + LOCKOUT_DURATION_MINUTES * 60_000;
          if (Date.now() < unlockAt) throw new AccountLockedError();
          await prisma.user.update({
            where: { id: user.id },
            data: { lockedAt: null, failedLoginAttempts: 0 },
          });
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) {
          const attempts = user.failedLoginAttempts + 1;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: attempts,
              lockedAt: attempts >= MAX_LOGIN_ATTEMPTS ? new Date() : undefined,
            },
          });
          return null;
        }

        if (user.failedLoginAttempts > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0 },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          accountType: user.accountType,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.accountType = (user as { accountType: AccountType }).accountType;
        token.isAdmin = (user as { isAdmin: boolean }).isAdmin;
      }
      if (trigger === "update" && session) {
        if (session.accountType) token.accountType = session.accountType;
        if (session.name) token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.accountType = token.accountType as AccountType;
        session.user.isAdmin = (token.isAdmin as boolean) ?? false;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        if (existingUser?.isSuspended) return false;
      }
      return true;
    },
  },
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      accountType: AccountType;
      isAdmin: boolean;
    };
  }
}

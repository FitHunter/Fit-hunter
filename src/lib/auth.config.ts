import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

// Edge-compatible config — no Prisma imports
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({ credentials: {} }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      const PROTECTED = ["/dashboard", "/admin"];
      const AUTH_PAGES = ["/login", "/register", "/forgot-password"];

      const isProtected = PROTECTED.some((p) => path.startsWith(p));
      const isAuthPage = AUTH_PAGES.some((p) => path.startsWith(p));

      if (!isLoggedIn && isProtected) return false;
      if (isLoggedIn && isAuthPage) return Response.redirect(new URL("/", nextUrl));

      return true;
    },
  },
};

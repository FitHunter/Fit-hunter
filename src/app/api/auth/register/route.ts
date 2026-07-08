import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { generateRandomCode, generateSecureToken, slugify } from "@/lib/utils";
import { AccountType } from "@/generated/prisma";
import { addHours } from "date-fns";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  accountType: z.nativeEnum(AccountType).default(AccountType.CONSUMER),
  // Gym fields (also reused for phone/city/state)
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  gymName: z.string().optional(),
  addressLine1: z.string().optional(),
  zip: z.string().optional(),
  knownFor: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit("auth", getClientIp(req));
  if (limited) return limited;

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const token = generateSecureToken(32);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          accountType: data.accountType,
          // Auto-verify until Resend domain (nextfit.app) is verified and EMAIL_FROM is set
          emailVerified: new Date(),
          verificationTokens: {
            create: {
              token,
              expires: addHours(new Date(), 24),
            },
          },
        },
      });

      // Trainer accounts get only a User row here — the TrainerProfile is
      // created lazily by /api/trainer/profile when they go through the
      // dashboard setup wizard (bio, photos, certs, specialties, video, billing).

      if (data.accountType === AccountType.GYM) {
        const gymSlug = `${slugify(data.gymName || data.name)}-${generateRandomCode(6).toLowerCase()}`;

        await tx.gymProfile.create({
          data: {
            userId: newUser.id,
            slug: gymSlug,
            name: data.gymName || data.name,
            addressLine1: data.addressLine1 || "",
            city: data.city || "",
            state: data.state || "",
            zip: data.zip || "",
            phone: data.phone || null,
            classesOffered: data.knownFor || null,
            isClaimed: true,
            claimStatus: "APPROVED",
            amenities: data.amenities?.length
              ? { create: data.amenities.map((a) => ({ amenity: a })) }
              : undefined,
          },
        });
      }

      return newUser;
    });

    sendVerificationEmail(data.email, token).catch((err) =>
      console.error("[register] email send failed:", err)
    );

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    console.error("[register]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

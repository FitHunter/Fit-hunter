import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { generateRandomCode, slugify } from "@/lib/utils";
import { AccountType } from "@/generated/prisma";
import { addHours } from "date-fns";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  accountType: z.nativeEnum(AccountType).default(AccountType.CONSUMER),
  // Trainer fields
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  trainingMode: z.enum(["in-person", "virtual", "both"]).optional(),
  specialties: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  // Gym fields
  gymName: z.string().optional(),
  addressLine1: z.string().optional(),
  zip: z.string().optional(),
  knownFor: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const token = generateRandomCode(32);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          accountType: data.accountType,
          // Auto-verify until Resend domain (fithunter.app) is verified and EMAIL_FROM is set
          emailVerified: new Date(),
          verificationTokens: {
            create: {
              token,
              expires: addHours(new Date(), 24),
            },
          },
        },
      });

      if (data.accountType === AccountType.TRAINER) {
        const slug = `${slugify(data.name)}-${generateRandomCode(6).toLowerCase()}`;
        const virtualAvailable =
          data.trainingMode === "virtual" || data.trainingMode === "both";

        await tx.trainerProfile.create({
          data: {
            userId: newUser.id,
            slug,
            displayName: data.name,
            phone: data.phone || null,
            city: data.city || null,
            state: data.state || null,
            virtualAvailable,
            wizardComplete: true,
            specialties: data.specialties?.length
              ? { create: data.specialties.map((s, i) => ({ specialty: s, sortOrder: i })) }
              : undefined,
            certifications: data.certifications?.length
              ? { create: data.certifications.map((c) => ({ name: c })) }
              : undefined,
          },
        });
      }

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

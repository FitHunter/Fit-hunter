import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify, generateUniqueSlug, isYoutubeOrVimeoUrl, isValidUrl } from "@/lib/utils";
import { MAX_TRAINER_SPECIALTIES_STARTER, MAX_TRAINER_SPECIALTIES_PRO } from "@/lib/constants";
import type { ProfileType } from "@/generated/prisma";

const createSchema = z.object({
  step: z.number().int().min(1).max(5),
  profileType: z.enum(["PERSONAL_TRAINER", "GROUP_FITNESS", "NUTRITIONIST", "WELLNESS_COACH", "PHYSICAL_THERAPIST"]).optional(),
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  certifications: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  virtualAvailable: z.boolean().optional(),
  bookingUrl: z.string().optional(),
  vslUrl: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  gymId: z.string().optional(),
  tier: z.enum(["FREE", "STARTER", "PRO"]).optional(),
  complete: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.accountType !== "TRAINER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = createSchema.parse(await req.json());
    let trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } });

    if (!trainer) {
      const baseName = data.displayName ?? session.user.name ?? "trainer";
      let slug = generateUniqueSlug(baseName);
      const existing = await prisma.trainerProfile.findUnique({ where: { slug } });
      if (existing) slug = generateUniqueSlug(baseName, Math.random().toString(36).slice(2, 6));

      trainer = await prisma.trainerProfile.create({
        data: {
          userId: session.user.id,
          slug,
          displayName: data.displayName ?? session.user.name ?? "New Trainer",
          profileType: (data.profileType as ProfileType) ?? "PERSONAL_TRAINER",
        },
      });
    }

    const updates: Record<string, unknown> = {};

    if (data.displayName) {
      updates.displayName = data.displayName;
      if (!trainer.wizardComplete) {
        let slug = slugify(data.displayName);
        const existing = await prisma.trainerProfile.findFirst({ where: { slug, NOT: { id: trainer.id } } });
        if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
        updates.slug = slug;
      }
    }
    if (data.profileType) updates.profileType = data.profileType;
    if (data.bio !== undefined) updates.bio = data.bio;
    if (data.photoUrl !== undefined) updates.photoUrl = data.photoUrl || null;
    if (data.virtualAvailable !== undefined) updates.virtualAvailable = data.virtualAvailable;
    if (data.city !== undefined) updates.city = data.city;
    if (data.state !== undefined) updates.state = data.state;
    if (data.zip !== undefined) updates.zip = data.zip;

    if (data.bookingUrl !== undefined) {
      if (data.bookingUrl && !isValidUrl(data.bookingUrl)) {
        return NextResponse.json({ error: "Invalid booking URL" }, { status: 400 });
      }
      updates.bookingUrl = data.bookingUrl || null;
    }

    if (data.vslUrl !== undefined) {
      if (data.vslUrl && !isYoutubeOrVimeoUrl(data.vslUrl)) {
        return NextResponse.json({ error: "VSL must be a YouTube or Vimeo URL" }, { status: 400 });
      }
      updates.vslUrl = data.vslUrl || null;
    }

    if (data.tier) updates.tier = data.tier;
    if (data.complete) updates.wizardComplete = true;

    const maxSpecialties = data.tier === "PRO" ? MAX_TRAINER_SPECIALTIES_PRO : MAX_TRAINER_SPECIALTIES_STARTER;

    await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
      if (Object.keys(updates).length) {
        await tx.trainerProfile.update({ where: { id: trainer!.id }, data: updates });
      }

      if (data.certifications !== undefined) {
        await tx.trainerCertification.deleteMany({ where: { trainerProfileId: trainer!.id } });
        if (data.certifications.length) {
          await tx.trainerCertification.createMany({
            data: data.certifications.map((name) => ({ trainerProfileId: trainer!.id, name })),
          });
        }
      }

      if (data.specialties !== undefined) {
        const limited = data.specialties.slice(0, maxSpecialties);
        await tx.trainerSpecialty.deleteMany({ where: { trainerProfileId: trainer!.id } });
        if (limited.length) {
          await tx.trainerSpecialty.createMany({
            data: limited.map((specialty, i) => ({ trainerProfileId: trainer!.id, specialty, sortOrder: i })),
          });
        }
      }

      if (data.gymId !== undefined) {
        await tx.trainerGymLink.deleteMany({ where: { trainerProfileId: trainer!.id } });
        if (data.gymId) {
          await tx.trainerGymLink.create({
            data: { trainerProfileId: trainer!.id, gymProfileId: data.gymId },
          });
        }
      }
    });

    const updated = await prisma.trainerProfile.findUnique({ where: { id: trainer.id } });
    return NextResponse.json({ success: true, trainer: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    console.error("[trainer/profile]", err);
    return NextResponse.json({ error: "Failed to save profile." }, { status: 500 });
  }
}

const editSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  headline: z.string().max(120).optional(),
  bio: z.string().max(2000).optional(),
  experience: z.string().max(2000).optional(),
  whoIWorkWith: z.string().max(1000).optional(),
  yearsExperience: z.number().int().min(0).max(60).optional().nullable(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  virtualAvailable: z.boolean().optional(),
  bookingUrl: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.accountType !== "TRAINER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = editSchema.parse(await req.json());
    const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } });
    if (!trainer) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const updates: Record<string, unknown> = {};
    if (data.displayName !== undefined) updates.displayName = data.displayName;
    if (data.headline !== undefined) updates.headline = data.headline || null;
    if (data.bio !== undefined) updates.bio = data.bio || null;
    if (data.experience !== undefined) updates.experience = data.experience || null;
    if (data.whoIWorkWith !== undefined) updates.whoIWorkWith = data.whoIWorkWith || null;
    if (data.yearsExperience !== undefined) updates.yearsExperience = data.yearsExperience;
    if (data.photoUrl !== undefined) updates.photoUrl = data.photoUrl || null;
    if (data.phone !== undefined) updates.phone = data.phone || null;
    if (data.city !== undefined) updates.city = data.city || null;
    if (data.state !== undefined) updates.state = data.state || null;
    if (data.virtualAvailable !== undefined) updates.virtualAvailable = data.virtualAvailable;
    if (data.bookingUrl !== undefined) {
      if (data.bookingUrl && !isValidUrl(data.bookingUrl)) {
        return NextResponse.json({ error: "Invalid booking URL" }, { status: 400 });
      }
      updates.bookingUrl = data.bookingUrl || null;
    }

    await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
      if (Object.keys(updates).length) {
        await tx.trainerProfile.update({ where: { id: trainer.id }, data: updates });
      }
      if (data.certifications !== undefined) {
        await tx.trainerCertification.deleteMany({ where: { trainerProfileId: trainer.id } });
        if (data.certifications.length) {
          await tx.trainerCertification.createMany({
            data: data.certifications.map((name) => ({ trainerProfileId: trainer.id, name })),
          });
        }
      }
      if (data.specialties !== undefined) {
        await tx.trainerSpecialty.deleteMany({ where: { trainerProfileId: trainer.id } });
        if (data.specialties.length) {
          await tx.trainerSpecialty.createMany({
            data: data.specialties.map((specialty, i) => ({ trainerProfileId: trainer.id, specialty, sortOrder: i })),
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    console.error("[trainer/profile PATCH]", err);
    return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const trainer = await prisma.trainerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      certifications: true,
      specialties: { orderBy: { sortOrder: "asc" } },
      photos: { orderBy: { sortOrder: "asc" } },
      gymLink: { include: { gymProfile: { select: { id: true, name: true } } } },
    },
  });

  return NextResponse.json({ trainer });
}

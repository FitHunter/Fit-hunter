import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify, generateUniqueSlug, isYoutubeOrVimeoUrl, isValidUrl } from "@/lib/utils";
import { MAX_TRAINER_SPECIALTIES_STARTER, MAX_TRAINER_SPECIALTIES_PRO } from "@/lib/constants";
import { geocodeCityState } from "@/lib/geocode";
import type { ProfileType } from "@/generated/prisma";

const specialtySchema = z.object({
  specialty: z.string().min(1),
  category: z.enum(["STYLE", "FOCUS"]),
});

const certificationSchema = z.object({
  name: z.string().min(1),
  // .nullable(): the edit form round-trips values loaded from the DB, where
  // unset URLs are null — without it, saving fails for anyone without one.
  certDocUrl: z.string().url().optional().nullable().or(z.literal("")),
});

const sharedFields = {
  education: z.string().max(2000).optional(),
  philosophy: z.string().max(300).optional(),
  yearsExperience: z.number().int().min(0).max(60).optional().nullable(),
  languages: z.array(z.string()).optional(),
  sessionTypes: z.array(z.string()).optional(),
  trainingLocations: z.array(z.string()).optional(),
  sessionLengths: z.array(z.number().int()).optional(),
  pricingModel: z.enum(["per_session", "package", "monthly"]).optional(),
  priceMin: z.number().int().min(0).optional().nullable(),
  priceMax: z.number().int().min(0).optional().nullable(),
  availabilityType: z.enum(["flexible", "limited"]).optional(),
  availabilityDays: z.array(z.string()).optional(),
  instagramHandle: z.string().max(100).optional(),
  youtubeHandle: z.string().max(100).optional(),
};

const createSchema = z.object({
  step: z.number().int().min(1).max(6),
  profileType: z.enum(["PERSONAL_TRAINER", "GROUP_FITNESS", "NUTRITIONIST", "WELLNESS_COACH", "PHYSICAL_THERAPIST"]).optional(),
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  photoUrl: z.string().url().optional().nullable().or(z.literal("")),
  certifications: z.array(certificationSchema).optional(),
  specialties: z.array(specialtySchema).optional(),
  virtualAvailable: z.boolean().optional(),
  bookingUrl: z.string().optional(),
  vslUrl: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  gymId: z.string().optional(),
  complete: z.boolean().optional(),
  ...sharedFields,
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
    if (data.education !== undefined) updates.education = data.education || null;
    if (data.philosophy !== undefined) updates.philosophy = data.philosophy || null;
    if (data.yearsExperience !== undefined) updates.yearsExperience = data.yearsExperience;
    if (data.languages !== undefined) updates.languages = data.languages;
    if (data.sessionTypes !== undefined) updates.sessionTypes = data.sessionTypes;
    if (data.trainingLocations !== undefined) updates.trainingLocations = data.trainingLocations;
    if (data.sessionLengths !== undefined) updates.sessionLengths = data.sessionLengths;
    if (data.pricingModel !== undefined) updates.pricingModel = data.pricingModel;
    if (data.priceMin !== undefined) updates.priceMin = data.priceMin;
    if (data.priceMax !== undefined) updates.priceMax = data.priceMax;
    if (data.availabilityType !== undefined) updates.availabilityType = data.availabilityType;
    if (data.availabilityDays !== undefined) updates.availabilityDays = data.availabilityDays;
    if (data.instagramHandle !== undefined) updates.instagramHandle = data.instagramHandle || null;
    if (data.youtubeHandle !== undefined) updates.youtubeHandle = data.youtubeHandle || null;

    // Geocode coordinates when city/state are provided (fire-and-forget)
    const geocodeCity = (data.city ?? trainer?.city) as string | null;
    const geocodeState = (data.state ?? trainer?.state) as string | null;
    if (geocodeCity && geocodeState) {
      geocodeCityState(geocodeCity, geocodeState).then((coords) => {
        if (coords) {
          prisma.trainerProfile.update({
            where: { id: trainer!.id },
            data: { lat: coords.lat, lng: coords.lng },
          }).catch(() => {});
        }
      }).catch(() => {});
    }

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

    if (data.complete) updates.wizardComplete = true;

    // Tier is set only by the Stripe webhook — never trusted from the client.
    // Enforce the specialty cap using the trainer's real tier in the database.
    const maxSpecialties = trainer.tier === "PRO" ? MAX_TRAINER_SPECIALTIES_PRO : MAX_TRAINER_SPECIALTIES_STARTER;

    await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
      if (Object.keys(updates).length) {
        await tx.trainerProfile.update({ where: { id: trainer!.id }, data: updates });
      }

      if (data.certifications !== undefined) {
        await tx.trainerCertification.deleteMany({ where: { trainerProfileId: trainer!.id } });
        if (data.certifications.length) {
          await tx.trainerCertification.createMany({
            data: data.certifications.map((c) => ({
              trainerProfileId: trainer!.id,
              name: c.name,
              certDocUrl: c.certDocUrl || null,
            })),
          });
        }
      }

      if (data.specialties !== undefined) {
        const limited = data.specialties.slice(0, maxSpecialties);
        await tx.trainerSpecialty.deleteMany({ where: { trainerProfileId: trainer!.id } });
        if (limited.length) {
          await tx.trainerSpecialty.createMany({
            data: limited.map((s, i) => ({
              trainerProfileId: trainer!.id,
              specialty: s.specialty,
              category: s.category,
              sortOrder: i,
            })),
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
      return NextResponse.json({ error: [err.issues[0].path.join("."), err.issues[0].message].filter(Boolean).join(": ") }, { status: 400 });
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
  photoUrl: z.string().url().optional().nullable().or(z.literal("")),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  virtualAvailable: z.boolean().optional(),
  bookingUrl: z.string().optional(),
  gymName: z.string().max(120).optional(),
  certifications: z.array(certificationSchema).optional(),
  specialties: z.array(specialtySchema).optional(),
  ...sharedFields,
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
    if (data.gymName !== undefined) updates.gymName = data.gymName || null;
    if (data.education !== undefined) updates.education = data.education || null;
    if (data.philosophy !== undefined) updates.philosophy = data.philosophy || null;
    if (data.languages !== undefined) updates.languages = data.languages;
    if (data.sessionTypes !== undefined) updates.sessionTypes = data.sessionTypes;
    if (data.trainingLocations !== undefined) updates.trainingLocations = data.trainingLocations;
    if (data.sessionLengths !== undefined) updates.sessionLengths = data.sessionLengths;
    if (data.pricingModel !== undefined) updates.pricingModel = data.pricingModel;
    if (data.priceMin !== undefined) updates.priceMin = data.priceMin;
    if (data.priceMax !== undefined) updates.priceMax = data.priceMax;
    if (data.availabilityType !== undefined) updates.availabilityType = data.availabilityType;
    if (data.availabilityDays !== undefined) updates.availabilityDays = data.availabilityDays;
    if (data.instagramHandle !== undefined) updates.instagramHandle = data.instagramHandle || null;
    if (data.youtubeHandle !== undefined) updates.youtubeHandle = data.youtubeHandle || null;
    if (data.bookingUrl !== undefined) {
      if (data.bookingUrl && !isValidUrl(data.bookingUrl)) {
        return NextResponse.json({ error: "Invalid booking URL" }, { status: 400 });
      }
      updates.bookingUrl = data.bookingUrl || null;
    }

    // Geocode when city or state changes, or if coordinates are missing
    const newCity = (data.city !== undefined ? data.city : trainer.city) ?? null;
    const newState = (data.state !== undefined ? data.state : trainer.state) ?? null;
    const cityOrStateChanged =
      (data.city !== undefined && data.city !== trainer.city) ||
      (data.state !== undefined && data.state !== trainer.state);
    const missingCoords = trainer.lat == null || trainer.lng == null;
    if ((cityOrStateChanged || missingCoords) && newCity && newState) {
      geocodeCityState(newCity, newState).then((coords) => {
        if (coords) {
          prisma.trainerProfile.update({
            where: { id: trainer.id },
            data: { lat: coords.lat, lng: coords.lng },
          }).catch(() => {});
        }
      }).catch(() => {});
    }

    await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
      if (Object.keys(updates).length) {
        await tx.trainerProfile.update({ where: { id: trainer.id }, data: updates });
      }
      if (data.certifications !== undefined) {
        await tx.trainerCertification.deleteMany({ where: { trainerProfileId: trainer.id } });
        if (data.certifications.length) {
          await tx.trainerCertification.createMany({
            data: data.certifications.map((c) => ({
              trainerProfileId: trainer.id,
              name: c.name,
              certDocUrl: c.certDocUrl || null,
            })),
          });
        }
      }
      if (data.specialties !== undefined) {
        await tx.trainerSpecialty.deleteMany({ where: { trainerProfileId: trainer.id } });
        if (data.specialties.length) {
          await tx.trainerSpecialty.createMany({
            data: data.specialties.map((s, i) => ({
              trainerProfileId: trainer.id,
              specialty: s.specialty,
              category: s.category,
              sortOrder: i,
            })),
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: [err.issues[0].path.join("."), err.issues[0].message].filter(Boolean).join(": ") }, { status: 400 });
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

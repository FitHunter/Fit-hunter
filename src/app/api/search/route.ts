import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RESULTS_PER_PAGE } from "@/lib/constants";
import { TrainerTier } from "@/generated/prisma";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") ?? "";
  const type = sp.get("type") ?? "";
  const specialty = sp.get("specialty") ?? "";
  const minRating = parseFloat(sp.get("minRating") ?? "0");
  const availability = sp.get("availability") ?? "";
  const verifiedOnly = sp.get("verified") === "1";
  const sortBy = sp.get("sort") ?? "rating";
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
  const cityFilter = sp.get("city") ?? "";
  const stateFilter = sp.get("state") ?? "";
  const lat = parseFloat(sp.get("lat") ?? "");
  const lng = parseFloat(sp.get("lng") ?? "");

  const skip = (page - 1) * RESULTS_PER_PAGE;
  const results: SearchResult[] = [];

  // Trainer search
  const isGymSearch = type === "GYM";
  if (!isGymSearch) {
    const profileTypeFilter = type && type !== "GYM" ? [type] : undefined;

    const trainers = await prisma.trainerProfile.findMany({
      where: {
        tier: { in: [TrainerTier.STARTER, TrainerTier.PRO] },
        wizardComplete: true,
        ...(q ? {
          OR: [
            { displayName: { contains: q, mode: "insensitive" } },
            { bio: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { specialties: { some: { specialty: { contains: q, mode: "insensitive" } } } },
          ],
        } : {}),
        ...(profileTypeFilter ? { profileType: { in: profileTypeFilter as never[] } } : {}),
        ...(specialty ? { specialties: { some: { specialty: { contains: specialty, mode: "insensitive" } } } } : {}),
        ...(minRating > 0 ? { averageRating: { gte: minRating } } : {}),
        ...(availability === "Virtual" ? { virtualAvailable: true } : {}),
        ...(availability === "In-Person" ? { virtualAvailable: false } : {}),
        ...(cityFilter ? { city: { contains: cityFilter, mode: "insensitive" as const } } : {}),
        ...(stateFilter ? { state: stateFilter } : {}),
      },
      include: {
        specialties: { orderBy: { sortOrder: "asc" }, take: 3 },
        certifications: { where: { isVerified: true }, take: 1 },
      },
      orderBy: sortBy === "reviews" ? { reviewCount: "desc" } : { averageRating: "desc" },
      skip,
      take: RESULTS_PER_PAGE,
    });

    for (const t of trainers) {
      results.push({
        id: t.id,
        kind: "trainer",
        name: t.displayName,
        slug: t.slug,
        photoUrl: t.photoUrl,
        city: t.city,
        state: t.state,
        profileType: t.profileType,
        topSpecialty: t.specialties[0]?.specialty ?? null,
        averageRating: t.averageRating,
        reviewCount: t.reviewCount,
        isVerified: t.certifications.length > 0,
        virtualAvailable: t.virtualAvailable,
        lat: t.lat,
        lng: t.lng,
      });
    }
  }

  // Gym search
  if (isGymSearch || !type) {
    const gyms = await prisma.gymProfile.findMany({
      where: {
        isClaimed: !isGymSearch ? undefined : true,
        ...(q ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { state: { contains: q, mode: "insensitive" } },
          ],
        } : {}),
        ...(verifiedOnly ? { tier: "VERIFIED" } : {}),
        ...(minRating > 0 ? { averageRating: { gte: minRating } } : {}),
        ...(cityFilter ? { city: { contains: cityFilter, mode: "insensitive" as const } } : {}),
        ...(stateFilter ? { state: stateFilter } : {}),
      },
      orderBy: sortBy === "reviews" ? { reviewCount: "desc" } : { averageRating: "desc" },
      skip: isGymSearch ? skip : 0,
      take: isGymSearch ? RESULTS_PER_PAGE : 10,
    });

    for (const g of gyms) {
      results.push({
        id: g.id,
        kind: "gym",
        name: g.name,
        slug: g.slug,
        photoUrl: null,
        city: g.city,
        state: g.state,
        profileType: null,
        topSpecialty: null,
        averageRating: g.averageRating,
        reviewCount: g.reviewCount,
        isVerified: g.tier === "VERIFIED",
        virtualAvailable: false,
        lat: g.lat,
        lng: g.lng,
      });
    }
  }

  // Sort by distance if coordinates provided
  if (!isNaN(lat) && !isNaN(lng)) {
    results.sort((a, b) => {
      const distA = a.lat && a.lng ? Math.hypot(a.lat - lat, a.lng - lng) : Infinity;
      const distB = b.lat && b.lng ? Math.hypot(b.lat - lat, b.lng - lng) : Infinity;
      return distA - distB;
    });
  }

  return NextResponse.json({ results, page, hasMore: results.length === RESULTS_PER_PAGE });
}

interface SearchResult {
  id: string;
  kind: "trainer" | "gym";
  name: string;
  slug: string;
  photoUrl: string | null;
  city: string | null;
  state: string | null;
  profileType: string | null;
  topSpecialty: string | null;
  averageRating: number | null;
  reviewCount: number;
  isVerified: boolean;
  virtualAvailable: boolean;
  lat: number | null;
  lng: number | null;
}

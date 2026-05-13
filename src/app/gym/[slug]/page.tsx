import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatRating, formatReviewerName } from "@/lib/utils";
import { DAYS_OF_WEEK } from "@/lib/constants";
import { Star, MapPin, Shield, Phone, Globe, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewList } from "@/components/reviews/review-list";
import { ContactGymModal } from "@/components/gym/contact-gym-modal";

interface Props { params: { slug: string } }

async function getGym(slug: string) {
  return prisma.gymProfile.findUnique({
    where: { slug },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      hours: { orderBy: { dayOfWeek: "asc" } },
      amenities: true,
      trainerLinks: {
        include: {
          trainerProfile: {
            select: {
              id: true, displayName: true, slug: true, photoUrl: true,
              profileType: true, averageRating: true, tier: true,
              specialties: { take: 1, orderBy: { sortOrder: "asc" } },
            },
          },
        },
      },
      reviews: {
        where: { status: "APPROVED" },
        include: { categoryRatings: true, user: { select: { name: true } }, response: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const gym = await getGym(params.slug);
  if (!gym) return {};
  const location = [gym.city, gym.state].filter(Boolean).join(", ");
  return {
    title: `${gym.name}${location ? ` — ${location}` : ""}`,
    description: `${gym.name} gym in ${location}. View photos, hours, amenities, and real member reviews.`,
  };
}

export default async function GymProfilePage({ params }: Props) {
  const gym = await getGym(params.slug);
  if (!gym) notFound();
  if (!gym.isClaimed && gym.tier === "UNCLAIMED") {
    // Show stub
    return <GymStubPage gym={gym} />;
  }

  const session = await auth();
  const location = [gym.addressLine1, gym.city, gym.state, gym.zip].filter(Boolean).join(", ");

  // Track view
  prisma.profileView.create({ data: { gymProfileId: gym.id } }).catch(() => {});

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: gym.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: gym.addressLine1,
      addressLocality: gym.city,
      addressRegion: gym.state,
      postalCode: gym.zip,
    },
    telephone: gym.phone,
    url: gym.website,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900">{gym.name}</h1>
                    {gym.tier === "VERIFIED" && (
                      <Badge variant="verified"><Shield className="h-3 w-3" />Verified</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {gym.averageRating ? (
                      <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="h-4 w-4 fill-current" />
                        {formatRating(gym.averageRating)}
                        <span className="text-gray-400 font-normal text-sm">({gym.reviewCount} reviews)</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">No reviews yet</span>
                    )}
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />{location}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Photos */}
            {gym.photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {gym.photos.slice(0, 6).map((photo) => (
                  <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                    <Image src={photo.url} alt={gym.name} fill className="object-cover" sizes="(max-width: 640px) 50vw, 33vw" />
                  </div>
                ))}
              </div>
            )}

            {/* Amenities */}
            {gym.amenities.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {gym.amenities.map((a) => (
                    <Badge key={a.id} variant="secondary">{a.amenity}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            {gym.pricingInfo && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-2">Pricing</h2>
                <p className="text-sm text-gray-700">{gym.pricingInfo}</p>
              </div>
            )}

            {/* Classes */}
            {gym.classesOffered && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-2">Classes Offered</h2>
                <p className="text-sm text-gray-700 whitespace-pre-line">{gym.classesOffered}</p>
              </div>
            )}

            {/* Who Works Here */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Who Works Here</h2>
              {gym.trainerLinks.length === 0 ? (
                <p className="text-sm text-gray-400">No trainers listed yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {gym.trainerLinks.map(({ trainerProfile: t }) => (
                    <Link key={t.id} href={`/trainer/${t.slug}`} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-sm transition-all">
                      <div className="relative w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                        {t.photoUrl ? (
                          <Image src={t.photoUrl} alt={t.displayName} fill className="object-cover" sizes="40px" />
                        ) : <div className="w-full h-full flex items-center justify-center text-lg">💪</div>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{t.displayName}</p>
                        <p className="text-xs text-gray-400 truncate">{t.specialties[0]?.specialty ?? "Fitness Professional"}</p>
                        {t.averageRating && (
                          <span className="text-xs text-amber-500 flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-current" />
                            {formatRating(t.averageRating)}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            <ReviewList
              reviews={gym.reviews.map((r) => ({
                id: r.id,
                overallRating: r.overallRating,
                writtenReview: r.writtenReview,
                reviewerName: formatReviewerName(r.user.name?.split(" ")[0] ?? "Anonymous", r.user.name?.split(" ").slice(1).join(" ")),
                createdAt: r.createdAt.toISOString(),
                categoryRatings: r.categoryRatings.map((cr) => ({ category: cr.category, rating: cr.rating })),
                response: r.response ? { body: r.response.body, gymName: gym.name } : null,
              }))}
              profileType="gym"
              profileId={gym.id}
              profileSlug={gym.slug}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 sticky top-20">
              <ContactGymModal
                gymId={gym.id}
                gymName={gym.name}
                isLoggedIn={!!session}
              />

              <div className="space-y-2 text-sm text-gray-600">
                {gym.phone && (
                  <a href={`tel:${gym.phone}`} className="flex items-center gap-2 hover:text-emerald-700">
                    <Phone className="h-4 w-4" />{gym.phone}
                  </a>
                )}
                {gym.website && (
                  <a href={gym.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-emerald-700">
                    <Globe className="h-4 w-4" />Website
                  </a>
                )}
              </div>

              {gym.hours.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 mb-2">
                    <Clock className="h-4 w-4" />Hours
                  </div>
                  <div className="space-y-1">
                    {gym.hours.map((h) => (
                      <div key={h.id} className="flex justify-between text-xs text-gray-600">
                        <span>{DAYS_OF_WEEK[h.dayOfWeek]}</span>
                        <span>{h.isClosed ? "Closed" : `${h.openTime} – ${h.closeTime}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function GymStubPage({ gym }: { gym: { id: string; name: string; addressLine1: string; city: string; state: string; zip: string; phone: string | null } }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Badge variant="unclaimed" className="mb-4">Unclaimed</Badge>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{gym.name}</h1>
        <p className="text-gray-500 mb-1">{gym.addressLine1}</p>
        <p className="text-gray-500 mb-6">{[gym.city, gym.state, gym.zip].filter(Boolean).join(", ")}</p>
        {gym.phone && <p className="text-gray-500 mb-6">{gym.phone}</p>}
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 mb-6">
          <p className="text-sm text-amber-800 font-medium">Is this your gym?</p>
          <p className="text-sm text-amber-700 mt-1">Claim this profile to add photos, hours, amenities, and respond to reviews.</p>
        </div>
        <Link href={`/gym/${gym.id}/claim`}>
          <Button className="w-full">Claim This Profile</Button>
        </Link>
      </div>
    </div>
  );
}

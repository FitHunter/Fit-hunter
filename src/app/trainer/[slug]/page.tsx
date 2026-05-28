import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatRating, formatReviewerName, getVslEmbedUrl } from "@/lib/utils";
import { PROFILE_TYPES } from "@/lib/constants";
import { Star, MapPin, Shield, ExternalLink, Wifi, Calendar, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContactTrainerModal } from "@/components/trainer/contact-trainer-modal";
import { ReviewList } from "@/components/reviews/review-list";

interface Props {
  params: { slug: string };
}

async function getTrainer(slug: string) {
  return prisma.trainerProfile.findUnique({
    where: { slug },
    include: {
      certifications: true,
      specialties: { orderBy: { sortOrder: "asc" } },
      photos: { orderBy: { sortOrder: "asc" } },
      gymLink: { include: { gymProfile: { select: { id: true, name: true, slug: true, city: true, state: true } } } },
      reviews: {
        where: { status: "APPROVED" },
        include: { categoryRatings: true, user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const trainer = await getTrainer(params.slug);
  if (!trainer) return {};

  const typeLabel = PROFILE_TYPES.find((p) => p.value === trainer.profileType)?.label ?? "Fitness Professional";
  const location = [trainer.city, trainer.state].filter(Boolean).join(", ");

  return {
    title: `${trainer.displayName} — ${typeLabel}${location ? ` in ${location}` : ""}`,
    description: trainer.bio ?? `${trainer.displayName} is a certified ${typeLabel.toLowerCase()} on FitHunter.`,
    openGraph: { images: trainer.photoUrl ? [trainer.photoUrl] : [] },
  };
}

export default async function TrainerProfilePage({ params }: Props) {
  const trainer = await getTrainer(params.slug);
  if (!trainer || !trainer.wizardComplete) notFound();

  const session = await auth();
  const typeLabel = PROFILE_TYPES.find((p) => p.value === trainer.profileType)?.label ?? "Fitness Professional";
  const location = [trainer.city, trainer.state].filter(Boolean).join(", ");
  const vslEmbed = trainer.vslUrl ? getVslEmbedUrl(trainer.vslUrl) : null;
  const isPro = trainer.tier === "PRO";

  // Profile view tracking (fire-and-forget)
  if (typeof window === "undefined") {
    prisma.profileView.create({ data: { trainerProfileId: trainer.id } }).catch(() => {});
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: trainer.displayName,
    description: trainer.bio,
    image: trainer.photoUrl,
    jobTitle: typeLabel,
    ...(trainer.city ? { addressLocality: trainer.city } : {}),
    ...(trainer.state ? { addressRegion: trainer.state } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
        {session?.user?.id === trainer.userId && (
          <div className="mb-6 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <p className="text-sm text-emerald-800 font-medium">You are viewing your public profile</p>
            <Link href="/dashboard/trainer/edit">
              <Button size="sm" variant="outline" className="border-emerald-400 text-emerald-700 hover:bg-emerald-100">
                <Pencil className="h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex gap-5 items-start">
                <div className="relative w-24 h-24 flex-shrink-0 rounded-xl bg-gray-100 overflow-hidden">
                  {trainer.photoUrl ? (
                    <Image src={trainer.photoUrl} alt={trainer.displayName} fill className="object-cover" sizes="96px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">💪</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900">{trainer.displayName}</h1>
                    {trainer.certifications.some((c) => c.isVerified) && (
                      <Badge variant="verified" className="mt-1">
                        <Shield className="h-3 w-3" />
                        FitHunter Verified
                      </Badge>
                    )}
                  </div>
                  {trainer.headline ? (
                    <p className="text-gray-700 font-medium mt-1">{trainer.headline}</p>
                  ) : (
                    <p className="text-gray-500 mt-1">{typeLabel}</p>
                  )}
                  {trainer.yearsExperience != null && (
                    <p className="text-sm text-gray-400 mt-0.5">{trainer.yearsExperience} years of experience</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {trainer.averageRating ? (
                      <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="h-4 w-4 fill-current" />
                        {formatRating(trainer.averageRating)}
                        <span className="text-gray-400 font-normal text-sm">({trainer.reviewCount} reviews)</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">No reviews yet</span>
                    )}
                    {location && (
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        {location}
                      </span>
                    )}
                    {trainer.virtualAvailable && (
                      <Badge variant="default">
                        <Wifi className="h-3 w-3" />
                        Virtual sessions available
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {trainer.bio && (
                <p className="mt-5 text-gray-700 leading-relaxed">{trainer.bio}</p>
              )}
            </div>

            {/* Certifications */}
            {trainer.certifications.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Certifications</h2>
                <div className="flex flex-wrap gap-2">
                  {trainer.certifications.map((cert) => (
                    <div key={cert.id} className="flex items-center gap-1.5">
                      <Badge variant={cert.isVerified ? "verified" : "secondary"}>
                        {cert.isVerified && <Shield className="h-3 w-3" />}
                        {cert.name}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specialties */}
            {trainer.specialties.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {trainer.specialties.map((s) => (
                    <Badge key={s.id} variant="outline">{s.specialty}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {trainer.experience && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Experience &amp; background</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{trainer.experience}</p>
              </div>
            )}

            {/* Who I work with */}
            {trainer.whoIWorkWith && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Who I work with</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{trainer.whoIWorkWith}</p>
              </div>
            )}

            {/* Photo gallery */}
            {trainer.photos.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Photos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {trainer.photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image src={photo.url} alt={photo.caption ?? "Training photo"} fill className="object-cover" sizes="200px" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VSL Video */}
            {isPro && vslEmbed && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Introduction Video</h2>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={vslEmbed}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Gym affiliation */}
            {(trainer.gymLink || trainer.gymName) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Works at</h2>
                {trainer.gymLink ? (
                  <Link
                    href={`/gym/${trainer.gymLink.gymProfile.slug}`}
                    className="flex items-center gap-2 text-emerald-700 hover:underline font-medium"
                  >
                    {trainer.gymLink.gymProfile.name}
                    <span className="text-gray-400 text-sm font-normal">
                      {[trainer.gymLink.gymProfile.city, trainer.gymLink.gymProfile.state].filter(Boolean).join(", ")}
                    </span>
                  </Link>
                ) : (
                  <p className="text-gray-800 font-medium">{trainer.gymName}</p>
                )}
              </div>
            )}

            {/* Reviews */}
            <ReviewList
              reviews={trainer.reviews.map((r) => ({
                id: r.id,
                overallRating: r.overallRating,
                writtenReview: r.writtenReview,
                reviewerName: formatReviewerName(r.user.name?.split(" ")[0] ?? "Anonymous", r.user.name?.split(" ").slice(1).join(" ")),
                createdAt: r.createdAt.toISOString(),
                categoryRatings: r.categoryRatings.map((cr) => ({ category: cr.category, rating: cr.rating })),
                response: null,
              }))}
              profileType="trainer"
              profileId={trainer.id}
              profileSlug={trainer.slug}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 sticky top-20">
              <ContactTrainerModal
                trainerId={trainer.id}
                trainerName={trainer.displayName}
                isLoggedIn={!!session}
              />

              {isPro && trainer.bookingUrl && (
                <a href={trainer.bookingUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4" />
                    Book a Session
                    <ExternalLink className="h-3.5 w-3.5 ml-auto" />
                  </Button>
                </a>
              )}

              <div className="text-xs text-gray-400 text-center pt-1">
                Contact is sent directly to the trainer — FitHunter doesn&apos;t share your info.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

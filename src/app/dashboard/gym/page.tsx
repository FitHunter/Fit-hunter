import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Star, ExternalLink, MessageSquare } from "lucide-react";
import { BillingButton } from "@/components/dashboard/billing-button";
import { FREE_LAUNCH } from "@/lib/constants";

export default async function GymDashboardPage() {
  const session = await auth();
  if (!session || session.user.accountType !== "GYM") redirect("/login");

  const gym = await prisma.gymProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      reviews: {
        where: { status: { in: ["APPROVED", "PENDING"] } },
        include: { user: { select: { name: true } }, response: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      trainerLinks: {
        include: { trainerProfile: { select: { displayName: true, slug: true, profileType: true } } },
      },
    },
  });

  // A GYM account always has a profile created at registration. If it's somehow
  // missing, the gym setup flow doesn't exist yet — send home instead of 404ing.
  if (!gym) redirect("/");

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [views7d, views30d] = await Promise.all([
    prisma.profileView.count({ where: { gymProfileId: gym.id, viewedAt: { gte: sevenDaysAgo } } }),
    prisma.profileView.count({ where: { gymProfileId: gym.id, viewedAt: { gte: thirtyDaysAgo } } }),
  ]);

  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/gym/${gym.slug}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gym Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">{gym.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={gym.tier === "VERIFIED" ? "verified" : gym.tier === "BASIC" ? "default" : "secondary"}>
            {gym.tier} Plan
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5"><div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Eye className="h-4 w-4" />Views (7d)</div><p className="text-2xl font-bold">{views7d}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Eye className="h-4 w-4" />Views (30d)</div><p className="text-2xl font-bold">{views30d}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Star className="h-4 w-4" />Rating</div><p className="text-2xl font-bold">{gym.averageRating ? gym.averageRating.toFixed(1) : "—"}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><MessageSquare className="h-4 w-4" />Reviews</div><p className="text-2xl font-bold">{gym.reviewCount}</p></CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">Your profile URL</p>
            <p className="text-sm font-medium text-gray-800 truncate">{profileUrl}</p>
          </div>
          <a href={profileUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm"><ExternalLink className="h-4 w-4" />View</Button>
          </a>
        </div>
        {!FREE_LAUNCH && <BillingButton />}
      </div>

      {/* Reviews */}
      <Card>
        <CardHeader><CardTitle className="text-base">Reviews</CardTitle></CardHeader>
        <CardContent>
          {gym.reviews.length === 0 ? (
            <p className="text-sm text-gray-400">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {gym.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{review.user.name ?? "Anonymous"}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{format(review.createdAt, "MMM d, yyyy")}</span>
                      <Badge variant={review.status === "APPROVED" ? "default" : "secondary"} className="text-xs">
                        {review.status.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < review.overallRating ? "text-amber-400 fill-current" : "text-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">{review.writtenReview}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trainers */}
      <Card>
        <CardHeader><CardTitle className="text-base">Trainers at {gym.name}</CardTitle></CardHeader>
        <CardContent>
          {gym.trainerLinks.length === 0 ? (
            <p className="text-sm text-gray-400">No trainers have linked to this gym yet.</p>
          ) : (
            <div className="space-y-2">
              {gym.trainerLinks.map(({ trainerProfile: t }) => (
                <div key={t.slug} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{t.displayName}</span>
                  <Link href={`/trainer/${t.slug}`} className="text-emerald-600 hover:underline text-xs">View profile</Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

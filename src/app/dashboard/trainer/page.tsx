import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageSquare, Star, ExternalLink, Settings } from "lucide-react";
import { BillingButton } from "@/components/dashboard/billing-button";

export default async function TrainerDashboardPage() {
  const session = await auth();
  if (!session || session.user.accountType !== "TRAINER") redirect("/login");

  const trainer = await prisma.trainerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      contactRequests: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      reviews: {
        where: { status: { in: ["APPROVED", "PENDING"] } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!trainer) redirect("/dashboard/trainer/setup");
  if (!trainer.wizardComplete) redirect("/dashboard/trainer/setup");

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [views7d, views30d] = await Promise.all([
    prisma.profileView.count({ where: { trainerProfileId: trainer.id, viewedAt: { gte: sevenDaysAgo } } }),
    prisma.profileView.count({ where: { trainerProfileId: trainer.id, viewedAt: { gte: thirtyDaysAgo } } }),
  ]);

  const isActive = trainer.subscriptionStatus === "ACTIVE";
  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/trainer/${trainer.slug}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainer Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">{trainer.displayName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
          <Link href="/dashboard/trainer/edit">
            <Button variant="outline" size="sm"><Settings className="h-4 w-4" />Edit Profile</Button>
          </Link>
        </div>
      </div>

      {/* Inactive subscription banner */}
      {!isActive && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-amber-900">Your profile is not visible in search</p>
            <p className="text-sm text-amber-700 mt-0.5">
              An active subscription is required for your profile to appear in search results.
            </p>
          </div>
          <BillingButton label="Subscribe to appear in search" />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Eye className="h-4 w-4" />Views (7d)</div>
            <p className="text-2xl font-bold">{views7d}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Eye className="h-4 w-4" />Views (30d)</div>
            <p className="text-2xl font-bold">{views30d}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Star className="h-4 w-4" />Rating</div>
            <p className="text-2xl font-bold">{trainer.averageRating ? trainer.averageRating.toFixed(1) : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><MessageSquare className="h-4 w-4" />Reviews</div>
            <p className="text-2xl font-bold">{trainer.reviewCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile link + billing */}
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
        <BillingButton label="Manage Billing" />
      </div>

      {/* Contact requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {trainer.contactRequests.length === 0 ? (
            <p className="text-sm text-gray-400">No contact requests yet.</p>
          ) : (
            <div className="space-y-3">
              {trainer.contactRequests.map((req) => (
                <div key={req.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm text-gray-900">{req.senderName}</p>
                    <span className="text-xs text-gray-400">{format(req.createdAt, "MMM d")}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{req.message}</p>
                  <a href={`mailto:${req.senderEmail}`} className="text-xs text-emerald-600 hover:underline mt-1 inline-block">
                    Reply via email
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {trainer.reviews.length === 0 ? (
            <p className="text-sm text-gray-400">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {trainer.reviews.map((review) => (
                <div key={review.id} className="flex items-center justify-between gap-2 border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 line-clamp-1">{review.writtenReview}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{format(review.createdAt, "MMM d, yyyy")}</p>
                  </div>
                  <Badge variant={review.status === "APPROVED" ? "default" : review.status === "REJECTED" ? "destructive" : "secondary"}>
                    {review.status.toLowerCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

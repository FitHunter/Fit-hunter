import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewModerationActions } from "@/components/admin/review-moderation-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Review Queue — Admin" };

export default async function AdminReviewsPage() {
  const session = await auth();
  if (!session?.user.isAdmin) redirect("/");

  const pending = await prisma.review.findMany({
    where: { status: "PENDING" },
    include: {
      user: { select: { name: true, email: true } },
      trainerProfile: { select: { displayName: true, slug: true } },
      gymProfile: { select: { name: true, slug: true } },
      categoryRatings: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Review Moderation Queue</h1>
      <p className="text-gray-500 text-sm">{pending.length} pending review{pending.length !== 1 ? "s" : ""}</p>

      {pending.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">✅</div>
          <p>All reviews moderated — queue is empty.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between gap-3 flex-wrap">
                  <span>
                    {review.trainerProfile ? (
                      <>Review of <a href={`/trainer/${review.trainerProfile.slug}`} className="text-emerald-700 hover:underline">{review.trainerProfile.displayName}</a></>
                    ) : (
                      <>Review of <a href={`/gym/${review.gymProfile?.slug}`} className="text-emerald-700 hover:underline">{review.gymProfile?.name}</a></>
                    )}
                  </span>
                  <span className="text-xs text-gray-400 font-normal">{format(review.createdAt, "MMM d, yyyy 'at' h:mm a")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">By:</span> {review.user.name ?? "Unknown"} ({review.user.email})
                </div>
                <div className="text-sm">
                  <span className="font-medium">Overall rating:</span> {review.overallRating}/5
                </div>
                {review.categoryRatings.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">Categories:</span>{" "}
                    {review.categoryRatings.map((cr) => `${cr.category}: ${cr.rating}/5`).join(" · ")}
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                  {review.writtenReview}
                </div>
                <ReviewModerationActions reviewId={review.id} reviewerEmail={review.user.email} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

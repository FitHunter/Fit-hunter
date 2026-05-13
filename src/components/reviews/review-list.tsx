"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRating } from "@/lib/utils";
import { format } from "date-fns";

interface CategoryRating { category: string; rating: number }
interface ReviewItem {
  id: string;
  overallRating: number;
  writtenReview: string;
  reviewerName: string;
  createdAt: string;
  categoryRatings: CategoryRating[];
  response: { body: string; gymName: string } | null;
}

interface Props {
  reviews: ReviewItem[];
  profileType: "trainer" | "gym";
  profileId: string;
  profileSlug: string;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-amber-400 fill-current" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export function ReviewList({ reviews, profileType, profileSlug }: Props) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900">
          Reviews {reviews.length > 0 && <span className="text-gray-400 font-normal">({reviews.length})</span>}
        </h2>
        <Link href={`/${profileType}/${profileSlug}/write-review`}>
          <Button variant="outline" size="sm">Write a review</Button>
        </Link>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">No reviews yet — be the first!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {displayed.map((review) => (
            <div key={review.id} className="border-b border-gray-100 last:border-0 pb-5 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <StarRow rating={review.overallRating} />
                    <span className="font-semibold text-sm text-gray-800">{formatRating(review.overallRating)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {review.reviewerName} · {format(new Date(review.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>

              {review.categoryRatings.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
                  {review.categoryRatings.map((cr) => (
                    <div key={cr.category} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{cr.category}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < cr.rating ? "text-amber-400 fill-current" : "text-gray-200"}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-3 text-sm text-gray-700 leading-relaxed">{review.writtenReview}</p>

              {review.response && (
                <div className="mt-3 bg-gray-50 rounded-lg p-3 border-l-2 border-emerald-400">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Response from {review.response.gymName}</p>
                  <p className="text-sm text-gray-600">{review.response.body}</p>
                </div>
              )}
            </div>
          ))}

          {reviews.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-emerald-600 hover:underline font-medium"
            >
              {showAll ? "Show fewer" : `Show all ${reviews.length} reviews`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

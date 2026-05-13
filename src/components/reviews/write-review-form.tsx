"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
  profileId: string;
  profileName: string;
  profileType: "trainer" | "gym";
  profileSlug: string;
  categories: string[];
}

const schema = z.object({
  overallRating: z.number().int().min(1, "Please select a star rating").max(5),
  categoryRatings: z.record(z.string(), z.number().int().min(1).max(5)).optional(),
  writtenReview: z.string().min(20, "Review must be at least 20 characters").max(1000),
  confirmedTraining: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                n <= (hover || value) ? "text-amber-400 fill-current" : "text-gray-200"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export function WriteReviewForm({ profileId, profileName, profileType, profileSlug, categories }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [catRatings, setCatRatings] = useState<Record<string, number>>({});

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { overallRating: 0 },
  });

  async function onSubmit(data: FormValues) {
    setError("");
    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        [`${profileType}ProfileId`]: profileId,
        overallRating: data.overallRating,
        writtenReview: data.writtenReview,
        confirmedTraining: data.confirmedTraining,
        categoryRatings: Object.entries(catRatings).map(([category, rating]) => ({ category, rating })),
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Something went wrong.");
      return;
    }

    router.push(`/${profileType}/${profileSlug}?reviewed=1`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review {profileName}</CardTitle>
        <CardDescription>Share your honest experience to help others make great fitness decisions.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Overall rating *</Label>
            <Controller
              control={control}
              name="overallRating"
              render={({ field }) => (
                <StarPicker value={field.value} onChange={field.onChange} />
              )}
            />
            {errors.overallRating && <p className="text-xs text-red-600">{errors.overallRating.message}</p>}
          </div>

          {categories.length > 0 && (
            <div className="space-y-3">
              <Label>Category ratings</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div key={cat} className="space-y-1">
                    <p className="text-sm text-gray-600">{cat}</p>
                    <StarPicker
                      value={catRatings[cat] ?? 0}
                      onChange={(n) => setCatRatings((prev) => ({ ...prev, [cat]: n }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="writtenReview">Your review *</Label>
            <Textarea
              id="writtenReview"
              {...register("writtenReview")}
              rows={5}
              placeholder="Describe your experience in at least 20 characters..."
            />
            {errors.writtenReview && <p className="text-xs text-red-600">{errors.writtenReview.message}</p>}
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("confirmedTraining")}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-600">
              I confirm that I have {profileType === "trainer" ? "trained with this person" : "visited or been a member of this gym"} and this review reflects my honest experience.
            </span>
          </label>
          {errors.confirmedTraining && <p className="text-xs text-red-600">{errors.confirmedTraining.message}</p>}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Submit review
          </Button>
          <p className="text-xs text-gray-400 text-center">
            Reviews are published after moderation (24–48 hours).
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReviewSubmittedConfirmation } from "@/lib/email";
import { addHours } from "date-fns";
import { REVIEW_EDIT_WINDOW_HOURS } from "@/lib/constants";
import { enforceRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  trainerProfileId: z.string().optional(),
  gymProfileId: z.string().optional(),
  overallRating: z.number().int().min(1).max(5),
  writtenReview: z.string().min(20).max(1000),
  confirmedTraining: z.boolean(),
  categoryRatings: z.array(z.object({
    category: z.string(),
    rating: z.number().int().min(1).max(5),
  })),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.accountType !== "CONSUMER") {
    return NextResponse.json({ error: "Only consumer accounts can leave reviews." }, { status: 403 });
  }

  const limited = await enforceRateLimit("email", session.user.id);
  if (limited) return limited;

  try {
    const data = schema.parse(await req.json());

    if (!data.trainerProfileId && !data.gymProfileId) {
      return NextResponse.json({ error: "Must specify a trainer or gym." }, { status: 400 });
    }

    // The "I trained here / worked with them" confirmation is the integrity
    // signal for reviews — reject if it wasn't affirmed.
    if (!data.confirmedTraining) {
      return NextResponse.json(
        { error: "Please confirm you actually trained with this professional or at this gym." },
        { status: 400 }
      );
    }

    // Ensure the review target actually exists (prevents reviews pointed at
    // arbitrary or non-existent profile IDs).
    if (data.trainerProfileId) {
      const exists = await prisma.trainerProfile.findUnique({
        where: { id: data.trainerProfileId },
        select: { id: true },
      });
      if (!exists) return NextResponse.json({ error: "Trainer not found." }, { status: 404 });
    }
    if (data.gymProfileId) {
      const exists = await prisma.gymProfile.findUnique({
        where: { id: data.gymProfileId },
        select: { id: true },
      });
      if (!exists) return NextResponse.json({ error: "Gym not found." }, { status: 404 });
    }

    // Check for duplicate
    const existing = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        ...(data.trainerProfileId ? { trainerProfileId: data.trainerProfileId } : {}),
        ...(data.gymProfileId ? { gymProfileId: data.gymProfileId } : {}),
      },
    });

    if (existing) {
      return NextResponse.json({ error: "You have already submitted a review for this listing." }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        trainerProfileId: data.trainerProfileId,
        gymProfileId: data.gymProfileId,
        overallRating: data.overallRating,
        writtenReview: data.writtenReview,
        confirmedTraining: data.confirmedTraining,
        editableUntil: addHours(new Date(), REVIEW_EDIT_WINDOW_HOURS),
        categoryRatings: {
          create: data.categoryRatings.map((cr) => ({
            category: cr.category,
            rating: cr.rating,
          })),
        },
      },
    });

    // Best-effort: the review is already saved for moderation.
    await sendReviewSubmittedConfirmation(session.user.email).catch((err) =>
      console.error("[review] confirmation email failed:", err)
    );

    return NextResponse.json({ success: true, reviewId: review.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }
}

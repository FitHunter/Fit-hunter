import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReviewSubmittedConfirmation } from "@/lib/email";
import { addHours } from "date-fns";
import { REVIEW_EDIT_WINDOW_HOURS } from "@/lib/constants";

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

  try {
    const data = schema.parse(await req.json());

    if (!data.trainerProfileId && !data.gymProfileId) {
      return NextResponse.json({ error: "Must specify a trainer or gym." }, { status: 400 });
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

    await sendReviewSubmittedConfirmation(session.user.email);

    return NextResponse.json({ success: true, reviewId: review.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }
}

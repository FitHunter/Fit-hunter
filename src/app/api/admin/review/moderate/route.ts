import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReviewRejectedEmail } from "@/lib/email";

const schema = z.object({
  reviewId: z.string(),
  action: z.enum(["approve", "reject", "flag"]),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { reviewId, action, reason } = schema.parse(await req.json());

    if (action === "reject" && !reason) {
      return NextResponse.json({ error: "Rejection reason is required." }, { status: 400 });
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { user: { select: { email: true } } },
    });

    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    if (action === "approve") {
      await prisma.review.update({
        where: { id: reviewId },
        data: { status: "APPROVED", approvedAt: new Date() },
      });

      // Update aggregate rating
      if (review.trainerProfileId) {
        const agg = await prisma.review.aggregate({
          where: { trainerProfileId: review.trainerProfileId, status: "APPROVED" },
          _avg: { overallRating: true },
          _count: true,
        });
        await prisma.trainerProfile.update({
          where: { id: review.trainerProfileId },
          data: { averageRating: agg._avg.overallRating, reviewCount: agg._count },
        });
      }

      if (review.gymProfileId) {
        const agg = await prisma.review.aggregate({
          where: { gymProfileId: review.gymProfileId, status: "APPROVED" },
          _avg: { overallRating: true },
          _count: true,
        });
        await prisma.gymProfile.update({
          where: { id: review.gymProfileId },
          data: { averageRating: agg._avg.overallRating, reviewCount: agg._count },
        });
      }
    } else if (action === "reject") {
      await prisma.review.update({
        where: { id: reviewId },
        data: { status: "REJECTED", rejectionReason: reason },
      });
      await sendReviewRejectedEmail(review.user.email, reason!);
    } else {
      await prisma.review.update({
        where: { id: reviewId },
        data: { status: "FLAGGED", flaggedAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    return NextResponse.json({ error: "Moderation failed." }, { status: 500 });
  }
}

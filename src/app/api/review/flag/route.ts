import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ reviewId: z.string(), reason: z.string().optional() });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { reviewId, reason } = schema.parse(await req.json());

    await prisma.reviewFlag.create({
      data: { reviewId, userId: session.user.id, reason },
    });

    await prisma.review.update({
      where: { id: reviewId },
      data: { flaggedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Could not flag review." }, { status: 500 });
  }
}

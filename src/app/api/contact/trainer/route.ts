import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendContactNotificationToTrainer, sendContactConfirmationToSender } from "@/lib/email";
import { enforceRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  trainerProfileId: z.string(),
  message: z.string().min(10).max(1000),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = await enforceRateLimit("email", session.user.id);
  if (limited) return limited;

  try {
    const data = schema.parse(await req.json());

    const trainer = await prisma.trainerProfile.findUnique({
      where: { id: data.trainerProfileId },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!trainer) return NextResponse.json({ error: "Trainer not found" }, { status: 404 });

    await prisma.contactRequest.create({
      data: {
        senderId: session.user.id,
        trainerProfileId: data.trainerProfileId,
        message: data.message,
        senderEmail: session.user.email,
        senderName: session.user.name ?? session.user.email,
      },
    });

    // Best-effort: the request is already recorded above and appears in the
    // trainer's dashboard — a failed notification email must not fail the API.
    await Promise.all([
      sendContactNotificationToTrainer({
        trainerEmail: trainer.user.email,
        trainerName: trainer.displayName,
        senderName: session.user.name ?? session.user.email,
        senderEmail: session.user.email,
        message: data.message,
      }),
      sendContactConfirmationToSender({
        senderEmail: session.user.email,
        senderName: session.user.name ?? "there",
        recipientName: trainer.displayName,
      }),
    ]).catch((err) => console.error("[contact/trainer] notification email failed:", err));

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}

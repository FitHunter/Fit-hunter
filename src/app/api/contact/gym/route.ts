import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendContactNotificationToGym, sendContactConfirmationToSender } from "@/lib/email";
import { CONTACT_SUBJECTS } from "@/lib/constants";
import { enforceRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  gymProfileId: z.string(),
  subject: z.enum(CONTACT_SUBJECTS as unknown as [string, ...string[]]),
  message: z.string().min(10).max(1000),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = await enforceRateLimit("email", session.user.id);
  if (limited) return limited;

  try {
    const data = schema.parse(await req.json());

    const gym = await prisma.gymProfile.findUnique({
      where: { id: data.gymProfileId },
      include: { user: { select: { email: true } } },
    });

    if (!gym || !gym.user?.email) return NextResponse.json({ error: "Gym not found" }, { status: 404 });

    await prisma.contactRequest.create({
      data: {
        senderId: session.user.id,
        gymProfileId: data.gymProfileId,
        subject: data.subject,
        message: data.message,
        senderEmail: session.user.email,
        senderName: session.user.name ?? session.user.email,
      },
    });

    // Best-effort: the request is already recorded above and appears in the
    // gym's dashboard — a failed notification email must not fail the API.
    await Promise.all([
      sendContactNotificationToGym({
        gymEmail: gym.user.email,
        gymName: gym.name,
        senderName: session.user.name ?? session.user.email,
        senderEmail: session.user.email,
        subject: data.subject,
        message: data.message,
      }),
      sendContactConfirmationToSender({
        senderEmail: session.user.email,
        senderName: session.user.name ?? "there",
        recipientName: gym.name,
      }),
    ]).catch((err) => console.error("[contact/gym] notification email failed:", err));

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}

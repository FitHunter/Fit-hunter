import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendContactNotificationToGym, sendContactConfirmationToSender } from "@/lib/email";
import { CONTACT_SUBJECTS } from "@/lib/constants";

const schema = z.object({
  gymProfileId: z.string(),
  subject: z.enum(CONTACT_SUBJECTS as unknown as [string, ...string[]]),
  message: z.string().min(10).max(1000),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { generateSecureToken } from "@/lib/utils";
import { addHours } from "date-fns";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit("auth", getClientIp(req));
  if (limited) return limited;

  try {
    const { email } = schema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to avoid user enumeration
    if (user) {
      const token = generateSecureToken(32);
      await prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expires: addHours(new Date(), 1),
        },
      });
      await sendPasswordResetEmail(email, token).catch((err) =>
        console.error("[forgot-password] email send failed:", err)
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

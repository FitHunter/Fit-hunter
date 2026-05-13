import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { generateRandomCode } from "@/lib/utils";
import { addHours } from "date-fns";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const { email } = schema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to avoid user enumeration
    if (user) {
      const token = generateRandomCode(32);
      await prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expires: addHours(new Date(), 1),
        },
      });
      await sendPasswordResetEmail(email, token);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

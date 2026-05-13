import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const { token, password } = schema.parse(await req.json());

    const record = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!record || record.used || record.expires < new Date()) {
      return NextResponse.json({ error: "This link has expired or already been used." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: record.userId } });
    if (!user?.password) {
      return NextResponse.json({ error: "Cannot reset password for this account." }, { status: 400 });
    }

    const sameAsOld = await bcrypt.compare(password, user.password);
    if (sameAsOld) {
      return NextResponse.json({ error: "New password must be different from your current password." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(password, 12) },
    });

    await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

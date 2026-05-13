import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createBillingPortalSession } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const returnUrl = `${appUrl}/dashboard/${session.user.accountType === "TRAINER" ? "trainer" : "gym"}`;

  let customerId: string | null = null;

  if (session.user.accountType === "TRAINER") {
    const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } });
    customerId = trainer?.stripeCustomerId ?? null;
  } else if (session.user.accountType === "GYM") {
    const gym = await prisma.gymProfile.findUnique({ where: { userId: session.user.id } });
    customerId = gym?.stripeCustomerId ?? null;
  }

  if (!customerId) {
    return NextResponse.json({ error: "No billing account found." }, { status: 404 });
  }

  const portalSession = await createBillingPortalSession(customerId, returnUrl);
  return NextResponse.json({ url: portalSession.url });
}

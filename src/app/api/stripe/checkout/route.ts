import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createStripeCustomer, createCheckoutSession, getTrainerPriceId, getGymPriceId } from "@/lib/stripe";
import type { TrainerTier, GymTier } from "@/generated/prisma";

const schema = z.object({
  tier: z.string(),
  profileType: z.enum(["trainer", "gym"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { tier, profileType } = schema.parse(await req.json());
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    if (profileType === "trainer") {
      const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } });
      if (!trainer) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

      const priceId = getTrainerPriceId(tier as TrainerTier);
      if (!priceId) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });

      let customerId = trainer.stripeCustomerId;
      if (!customerId) {
        const customer = await createStripeCustomer(session.user.email, session.user.name ?? "");
        customerId = customer.id;
        await prisma.trainerProfile.update({ where: { id: trainer.id }, data: { stripeCustomerId: customerId } });
      }

      const checkoutSession = await createCheckoutSession({
        customerId,
        priceId,
        successUrl: `${appUrl}/dashboard/trainer?subscribed=1`,
        cancelUrl: `${appUrl}/dashboard/trainer/billing`,
        metadata: { profileId: trainer.id, profileType: "trainer" },
      });

      return NextResponse.json({ url: checkoutSession.url });
    }

    // gym
    const gym = await prisma.gymProfile.findUnique({ where: { userId: session.user.id } });
    if (!gym) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const priceId = getGymPriceId(tier as GymTier);
    if (!priceId) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });

    let customerId = gym.stripeCustomerId;
    if (!customerId) {
      const customer = await createStripeCustomer(session.user.email, session.user.name ?? "");
      customerId = customer.id;
      await prisma.gymProfile.update({ where: { id: gym.id }, data: { stripeCustomerId: customerId } });
    }

    const checkoutSession = await createCheckoutSession({
      customerId,
      priceId,
      successUrl: `${appUrl}/dashboard/gym?subscribed=1`,
      cancelUrl: `${appUrl}/dashboard/gym/billing`,
      metadata: { profileId: gym.id, profileType: "gym" },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Checkout failed." }, { status: 500 });
  }
}

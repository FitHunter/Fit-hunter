import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendPaymentFailedEmail } from "@/lib/email";
import type { SubscriptionStatus } from "@/generated/prisma";

function stripeStatusToPrisma(status: string): SubscriptionStatus {
  const map: Record<string, SubscriptionStatus> = {
    active: "ACTIVE",
    canceled: "CANCELED",
    past_due: "PAST_DUE",
    trialing: "TRIALING",
    incomplete: "INCOMPLETE",
    incomplete_expired: "CANCELED",
    unpaid: "PAST_DUE",
  };
  return map[status] ?? "INCOMPLETE";
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  type SubObject = { id: string; customer: string; status: string; current_period_end: number; metadata?: Record<string, string>; items: { data: Array<{ price: { id: string } }> } };
  const sub = (event.data.object as unknown as SubObject);

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const customerId = sub.customer;
    const status = stripeStatusToPrisma(sub.status);
    const priceId = sub.items?.data[0]?.price?.id;
    const currentPeriodEnd = new Date(sub.current_period_end * 1000);

    const trainer = await prisma.trainerProfile.findUnique({ where: { stripeCustomerId: customerId } });
    if (trainer) {
      await prisma.trainerProfile.update({
        where: { id: trainer.id },
        data: {
          tier: status === "ACTIVE" ? "STARTER" : "FREE",
          subscriptionStatus: status,
          currentPeriodEnd,
        },
      });
      return NextResponse.json({ received: true });
    }

    const gym = await prisma.gymProfile.findUnique({ where: { stripeCustomerId: customerId } });
    if (gym) {
      await prisma.gymProfile.update({
        where: { id: gym.id },
        data: {
          tier: status === "ACTIVE" ? "BASIC" : "UNCLAIMED",
          subscriptionStatus: status,
          currentPeriodEnd,
        },
      });
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as { customer: string };
    const trainer = await prisma.trainerProfile.findUnique({
      where: { stripeCustomerId: invoice.customer },
      include: { user: { select: { email: true, name: true } } },
    });
    if (trainer) {
      await sendPaymentFailedEmail(trainer.user.email, trainer.user.name ?? trainer.displayName);
    } else {
      const gym = await prisma.gymProfile.findUnique({
        where: { stripeCustomerId: invoice.customer },
        include: { user: { select: { email: true, name: true } } },
      });
      if (gym?.user) {
        await sendPaymentFailedEmail(gym.user.email, gym.user.name ?? gym.name);
      }
    }
  }

  return NextResponse.json({ received: true });
}

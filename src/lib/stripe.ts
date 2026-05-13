import Stripe from "stripe";
import { TrainerTier, GymTier } from "@/generated/prisma";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export function getTrainerPriceId(tier: TrainerTier): string | null {
  const map: Partial<Record<TrainerTier, string>> = {
    STARTER: process.env.STRIPE_TRAINER_STARTER_PRICE_ID!,
    PRO: process.env.STRIPE_TRAINER_PRO_PRICE_ID!,
  };
  return map[tier] ?? null;
}

export function getGymPriceId(tier: GymTier): string | null {
  const map: Partial<Record<GymTier, string>> = {
    BASIC: process.env.STRIPE_GYM_BASIC_PRICE_ID!,
    VERIFIED: process.env.STRIPE_GYM_VERIFIED_PRICE_ID!,
  };
  return map[tier] ?? null;
}

export async function createStripeCustomer(email: string, name: string) {
  return stripe.customers.create({ email, name });
}

export async function createCheckoutSession(opts: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  return stripe.checkout.sessions.create({
    customer: opts.customerId,
    mode: "subscription",
    line_items: [{ price: opts.priceId, quantity: 1 }],
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    metadata: opts.metadata,
  });
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

// Checkout currently subscribes trainers at the Starter tier and gyms at
// Basic (matching the env vars that exist). The un-suffixed names are kept
// as an override for backward compatibility.
export function getTrainerPriceId(): string | null {
  return (
    process.env.STRIPE_TRAINER_PRICE_ID ??
    process.env.STRIPE_TRAINER_STARTER_PRICE_ID ??
    null
  );
}

export function getGymPriceId(): string | null {
  return (
    process.env.STRIPE_GYM_PRICE_ID ??
    process.env.STRIPE_GYM_BASIC_PRICE_ID ??
    null
  );
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
    allow_promotion_codes: true,
  });
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

import Stripe from "stripe";
import { StripeNotConfiguredError } from "@/lib/errors";
import { getPlan, type PaidPlanId } from "@/lib/plans";

export { getSiteUrl } from "@/lib/site-url";

let cached: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new StripeNotConfiguredError();
  }
  if (!cached) {
    cached = new Stripe(key);
  }
  return cached;
}

export function requireStripe(): Stripe {
  return getStripe();
}

export function subscriptionPriceData(tier: PaidPlanId) {
  const plan = getPlan(tier);
  const amount = plan.priceCents ?? 0;
  return {
    currency: "usd" as const,
    unit_amount: amount,
    recurring: { interval: "month" as const },
    product_data: {
      name: `RoleCall ${plan.name}`,
      description: plan.blurb,
    },
  };
}

export function creditPackPriceData(cents: number, label: string) {
  return {
    currency: "usd" as const,
    unit_amount: cents,
    product_data: {
      name: `RoleCall ad credits ${label}`,
      description: "One-time ad credits to promote a published job on the board.",
    },
  };
}

export function customerIdOf(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
): string | null {
  if (!customer) {
    return null;
  }
  return typeof customer === "string" ? customer : customer.id;
}

export function paymentIntentIdOf(
  paymentIntent: string | Stripe.PaymentIntent | null,
): string | null {
  if (!paymentIntent) {
    return null;
  }
  return typeof paymentIntent === "string" ? paymentIntent : paymentIntent.id;
}

export function subscriptionIdOf(
  subscription: string | Stripe.Subscription | null,
): string | null {
  if (!subscription) {
    return null;
  }
  return typeof subscription === "string" ? subscription : subscription.id;
}

export function subscriptionPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const unix = subscription.items.data[0]?.current_period_end;
  return typeof unix === "number" ? new Date(unix * 1000) : null;
}

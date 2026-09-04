import { PlanLimitError } from "@/lib/errors";
import type { SubscriptionTier } from "@/lib/types";

export type PlanDefinition = {
  id: SubscriptionTier;
  name: string;
  priceLabel: string;
  priceCents: number | null;
  blurb: string;
  activeJobs: number | "unlimited";
  seats: number | "unlimited";
  rankingMultiplier: number;
  featured: boolean;
  customDomain: boolean;
  highlights: string[];
};

export const PLANS: PlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    priceLabel: "$0",
    priceCents: 0,
    blurb: "Post a couple of roles and see how the board works.",
    activeJobs: 2,
    seats: 2,
    rankingMultiplier: 1,
    featured: false,
    customDomain: false,
    highlights: [
      "2 active jobs",
      "2 team seats",
      "1.0× ranking",
      "Ad credits available",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "$49",
    priceCents: 4900,
    blurb: "For teams hiring every month.",
    activeJobs: 10,
    seats: 5,
    rankingMultiplier: 1.5,
    featured: false,
    customDomain: true,
    highlights: [
      "10 active jobs",
      "5 team seats",
      "1.5× ranking",
      "Custom careers domain",
    ],
  },
  {
    id: "pro_plus",
    name: "Pro Plus",
    priceLabel: "$149",
    priceCents: 14900,
    blurb: "Pinned placement on the RoleCall board.",
    activeJobs: 40,
    seats: 15,
    rankingMultiplier: 2.5,
    featured: true,
    customDomain: true,
    highlights: [
      "40 active jobs",
      "15 team seats",
      "2.5× ranking",
      "Featured pin on the board",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceLabel: "Custom",
    priceCents: null,
    blurb: "Unlimited seats, jobs, and a named partner.",
    activeJobs: "unlimited",
    seats: "unlimited",
    rankingMultiplier: 2.5,
    featured: true,
    customDomain: true,
    highlights: [
      "Unlimited jobs and seats",
      "2.5× ranking",
      "Featured pin",
      "Ad credits included",
    ],
  },
];

export const TIER_MULTIPLIER: Record<SubscriptionTier, number> = {
  free: 1,
  pro: 1.5,
  pro_plus: 2.5,
  enterprise: 2.5,
};

export const AD_CREDIT_PACKS = [
  { label: "$10", cents: 1000 },
  { label: "$25", cents: 2500 },
  { label: "$100", cents: 10000 },
] as const;

export const PROMOTION_PACKS = [
  { label: "7 days", days: 7, cents: 1000 },
  { label: "21 days", days: 21, cents: 2500 },
  { label: "70 days", days: 70, cents: 10000 },
] as const;

export type PaidPlanId = "pro" | "pro_plus";

export function creditPackForCents(cents: number) {
  return AD_CREDIT_PACKS.find((pack) => pack.cents === cents) ?? null;
}

export function promotionForCents(cents: number) {
  return PROMOTION_PACKS.find((pack) => pack.cents === cents) ?? null;
}

export function effectiveTier(
  subscriptionTier: SubscriptionTier,
  overrideTier: SubscriptionTier | null,
): SubscriptionTier {
  return overrideTier ?? subscriptionTier;
}

const TIER_ORDER: SubscriptionTier[] = ["free", "pro", "pro_plus", "enterprise"];

export function getPlan(tier: SubscriptionTier): PlanDefinition {
  const plan = PLANS.find((item) => item.id === tier);
  if (!plan) {
    return PLANS[0];
  }
  return plan;
}

export function nextPlan(tier: SubscriptionTier): PlanDefinition | null {
  const index = TIER_ORDER.indexOf(tier);
  if (index < 0 || index === TIER_ORDER.length - 1) {
    return null;
  }
  return getPlan(TIER_ORDER[index + 1]);
}

export function companyPlan(
  subscriptionTier: SubscriptionTier,
  overrideTier: SubscriptionTier | null,
): PlanDefinition {
  return getPlan(effectiveTier(subscriptionTier, overrideTier));
}

function limitMessage(
  plan: PlanDefinition,
  kind: "active jobs" | "team seats",
  limit: number,
): string {
  const upgrade = nextPlan(plan.id);
  if (!upgrade) {
    return `Your ${plan.name} plan allows ${limit} ${kind}.`;
  }
  const nextLimit = kind === "active jobs" ? upgrade.activeJobs : upgrade.seats;
  const nextText = nextLimit === "unlimited" ? "unlimited" : String(nextLimit);
  return `Your ${plan.name} plan allows ${limit} ${kind}. Upgrade to ${upgrade.name} for ${nextText}.`;
}

export function assertJobLimit(plan: PlanDefinition, publishedCount: number) {
  if (plan.activeJobs === "unlimited") {
    return;
  }
  if (publishedCount >= plan.activeJobs) {
    throw new PlanLimitError(limitMessage(plan, "active jobs", plan.activeJobs), {
      limitName: "active jobs",
      currentPlan: plan.name,
      nextPlan: nextPlan(plan.id)?.name ?? null,
    });
  }
}

export function assertSeatLimit(plan: PlanDefinition, seatCount: number) {
  if (plan.seats === "unlimited") {
    return;
  }
  if (seatCount >= plan.seats) {
    throw new PlanLimitError(limitMessage(plan, "team seats", plan.seats), {
      limitName: "team seats",
      currentPlan: plan.name,
      nextPlan: nextPlan(plan.id)?.name ?? null,
    });
  }
}

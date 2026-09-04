export type SubscriptionTier = "free" | "pro" | "pro_plus" | "enterprise";

export const TIER_MULTIPLIER: Record<SubscriptionTier, number> = {
  free: 1,
  pro: 1.5,
  pro_plus: 2.5,
  enterprise: 2.5,
};

export const PLAN_LIMITS: Record<
  SubscriptionTier,
  { activeJobs: number | null; seats: number | null; label: string; priceLabel: string }
> = {
  free: { activeJobs: 2, seats: 2, label: "Free", priceLabel: "$0" },
  pro: { activeJobs: 10, seats: 5, label: "Pro", priceLabel: "$49/mo" },
  pro_plus: { activeJobs: 40, seats: 15, label: "Pro Plus", priceLabel: "$149/mo" },
  enterprise: {
    activeJobs: null,
    seats: null,
    label: "Enterprise",
    priceLabel: "Custom",
  },
};

export function effectiveTier(
  subscriptionTier: SubscriptionTier,
  overrideTier: string | null
): SubscriptionTier {
  if (
    overrideTier === "free" ||
    overrideTier === "pro" ||
    overrideTier === "pro_plus" ||
    overrideTier === "enterprise"
  ) {
    return overrideTier;
  }
  return subscriptionTier;
}

export function limitErrorMessage(
  kind: "jobs" | "seats",
  tiers: SubscriptionTier
): string {
  const limits = PLAN_LIMITS[tiers];
  if (kind === "jobs") {
    const n = limits.activeJobs ?? "unlimited";
    return `${limits.label} plan includes ${n} active jobs. Upgrade for higher limits.`;
  }
  const current = limits.seats ?? "unlimited";
  const next =
    tiers === "free"
      ? `Upgrade to Pro for ${PLAN_LIMITS.pro.seats}.`
      : tiers === "pro"
        ? `Upgrade to Pro Plus for ${PLAN_LIMITS.pro_plus.seats}.`
        : "Contact sales for Enterprise.";
  return `${limits.label} plan includes ${current} team members. ${next}`;
}

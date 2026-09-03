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

export function effectiveTier(
  subscriptionTier: SubscriptionTier,
  overrideTier: SubscriptionTier | null,
): SubscriptionTier {
  return overrideTier ?? subscriptionTier;
}

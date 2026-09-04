import { effectiveTier, TIER_MULTIPLIER, type SubscriptionTier } from "@/lib/plans";

export type RankableJob = {
  id: string;
  title: string;
  description: string;
  skills: string[] | null;
  publishedAt: Date | null;
  promotedUntil: Date | null;
  promotionSpendCents: number;
  companyName: string;
  subscriptionTier: SubscriptionTier;
  overrideTier: string | null;
  overrideBoost: boolean;
  textRelevance?: number;
};

export type RankedJob<T extends RankableJob> = T & {
  featuredRank: number;
  promotedRank: number;
  score: number;
  placement: "organic" | "pro" | "promoted" | "featured";
};

function daysSince(date: Date | null, now: Date): number {
  if (!date) return 365;
  return Math.max(0, (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function recencyDecay(publishedAt: Date | null, now = new Date()): number {
  const days = daysSince(publishedAt, now);
  return Math.max(0.25, Math.exp(-days / 21));
}

export function placementFor(job: RankableJob, now = new Date()): RankedJob<RankableJob>["placement"] {
  const tier = effectiveTier(job.subscriptionTier, job.overrideTier);
  const featured =
    job.overrideBoost || tier === "pro_plus" || tier === "enterprise";
  if (featured) return "featured";
  if (job.promotedUntil && job.promotedUntil > now) return "promoted";
  if (tier === "pro") return "pro";
  return "organic";
}

export function rankJobs<T extends RankableJob>(jobs: T[], now = new Date()): RankedJob<T>[] {
  const ranked = jobs.map((job) => {
    const tier = effectiveTier(job.subscriptionTier, job.overrideTier);
    const featuredRank =
      job.overrideBoost || tier === "pro_plus" || tier === "enterprise" ? 2 : 0;
    const promotedRank =
      job.promotedUntil && job.promotedUntil > now ? 1 : 0;
    const textRelevance = job.textRelevance ?? 1;
    const score =
      textRelevance *
      TIER_MULTIPLIER[tier] *
      recencyDecay(job.publishedAt, now) *
      (1 + Math.log10(1 + job.promotionSpendCents / 1000));

    return {
      ...job,
      featuredRank,
      promotedRank,
      score,
      placement: placementFor(job, now),
    };
  });

  return ranked.sort((a, b) => {
    if (b.featuredRank !== a.featuredRank) return b.featuredRank - a.featuredRank;
    if (b.promotedRank !== a.promotedRank) return b.promotedRank - a.promotedRank;
    if (b.score !== a.score) return b.score - a.score;
    const aTime = a.publishedAt?.getTime() ?? 0;
    const bTime = b.publishedAt?.getTime() ?? 0;
    return bTime - aTime;
  });
}

import { TIER_MULTIPLIER, effectiveTier } from "@/lib/plans";
import type { JobWithCompany, RailKind, RankedJob, SubscriptionTier } from "@/lib/types";

const FEATURED_TIERS: SubscriptionTier[] = ["pro_plus", "enterprise"];

function daysSince(date: Date, now: Date): number {
  return Math.max(0, (now.getTime() - date.getTime()) / 86_400_000);
}

export function recencyDecay(publishedAt: Date | null, now = new Date()): number {
  if (!publishedAt) {
    return 0.25;
  }
  return Math.max(0.25, Math.exp(-daysSince(publishedAt, now) / 21));
}

export function textRelevance(job: JobWithCompany, query: string | undefined): number {
  const needle = query?.trim().toLowerCase();
  if (!needle) {
    return 1;
  }

  const haystack = [
    job.title,
    job.department ?? "",
    job.location ?? "",
    job.company.name,
    job.skills.join(" "),
    job.description,
  ]
    .join(" ")
    .toLowerCase();

  if (haystack.includes(needle)) {
    return haystack.startsWith(needle) || job.title.toLowerCase().includes(needle)
      ? 1.4
      : 1.15;
  }

  const terms = needle.split(/\s+/).filter(Boolean);
  const hits = terms.filter((term) => haystack.includes(term)).length;
  return 0.35 + (0.65 * hits) / Math.max(terms.length, 1);
}

export function featuredRank(company: JobWithCompany["company"]): number {
  const tier = effectiveTier(company.subscriptionTier, company.overrideTier);
  if (company.overrideBoost || FEATURED_TIERS.includes(tier)) {
    return 2;
  }
  return 0;
}

export function promotedRank(job: JobWithCompany, now = new Date()): number {
  if (job.promotedUntil && job.promotedUntil.getTime() > now.getTime()) {
    return 1;
  }
  return 0;
}

export function jobScore(
  job: JobWithCompany,
  query: string | undefined,
  now = new Date(),
): number {
  const tier = effectiveTier(job.company.subscriptionTier, job.company.overrideTier);
  const spendBoost = 1 + Math.log10(1 + job.promotionSpendCents / 1000);
  return (
    textRelevance(job, query) *
    TIER_MULTIPLIER[tier] *
    recencyDecay(job.publishedAt, now) *
    spendBoost
  );
}

export function railFor(job: JobWithCompany, now = new Date()): RailKind {
  if (featuredRank(job.company) === 2) {
    return "featured";
  }
  if (promotedRank(job, now) === 1) {
    return "promoted";
  }
  if (effectiveTier(job.company.subscriptionTier, job.company.overrideTier) === "pro") {
    return "pro";
  }
  return "none";
}

export function rankJobs(
  jobs: JobWithCompany[],
  query?: string,
  now = new Date(),
): RankedJob[] {
  return jobs
    .map((job) => ({
      ...job,
      featuredRank: featuredRank(job.company),
      promotedRank: promotedRank(job, now),
      score: jobScore(job, query, now),
      rail: railFor(job, now),
    }))
    .sort((a, b) => {
      if (b.featuredRank !== a.featuredRank) {
        return b.featuredRank - a.featuredRank;
      }
      if (b.promotedRank !== a.promotedRank) {
        return b.promotedRank - a.promotedRank;
      }
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      const aTime = a.publishedAt?.getTime() ?? 0;
      const bTime = b.publishedAt?.getTime() ?? 0;
      return bTime - aTime;
    });
}

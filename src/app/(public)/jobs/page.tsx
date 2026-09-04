import Link from "next/link";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { JobCard } from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { companies, jobs } from "@/lib/db/schema";
import { rankJobs } from "@/lib/ranking";
import type { SubscriptionTier } from "@/lib/plans";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = one(params.q)?.trim() || "";
  const location = one(params.location)?.trim() || "";
  const remote = one(params.remote) === "1";
  const employmentType = one(params.type) || "";
  const hasFilters = Boolean(q || location || remote || employmentType);

  const filters = [eq(jobs.status, "published")];
  if (location) filters.push(ilike(jobs.location, `%${location}%`));
  if (remote) filters.push(eq(jobs.workplaceType, "remote"));
  if (
    employmentType === "full_time" ||
    employmentType === "part_time" ||
    employmentType === "contract" ||
    employmentType === "internship"
  ) {
    filters.push(eq(jobs.employmentType, employmentType));
  }
  if (q) {
    filters.push(
      or(
        ilike(jobs.title, `%${q}%`),
        ilike(jobs.description, `%${q}%`),
        sql`exists (select 1 from unnest(${jobs.skills}) s where s ilike ${"%" + q + "%"})`
      )!
    );
  }

  const rows = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      slug: jobs.slug,
      description: jobs.description,
      skills: jobs.skills,
      publishedAt: jobs.publishedAt,
      promotedUntil: jobs.promotedUntil,
      promotionSpendCents: jobs.promotionSpendCents,
      location: jobs.location,
      workplaceType: jobs.workplaceType,
      employmentType: jobs.employmentType,
      salaryMin: jobs.salaryMin,
      salaryMax: jobs.salaryMax,
      showSalary: jobs.showSalary,
      salaryPeriod: jobs.salaryPeriod,
      companyName: companies.name,
      companySlug: companies.slug,
      subscriptionTier: companies.subscriptionTier,
      overrideTier: companies.overrideTier,
      overrideBoost: companies.overrideBoost,
    })
    .from(jobs)
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .where(and(...filters))
    .orderBy(desc(jobs.publishedAt));

  const ranked = rankJobs(
    rows.map((r) => ({
      ...r,
      subscriptionTier: r.subscriptionTier as SubscriptionTier,
      skills: r.skills ?? [],
    }))
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Find your next role
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          Search open positions by title, skill, location, or work style.
        </p>
      </div>

      <form className="surface-card mt-8 grid gap-3 p-4 md:grid-cols-12 md:items-end">
        <div className="md:col-span-4">
          <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
            Keyword
          </label>
          <Input name="q" placeholder="Role, skill, or company" defaultValue={q} />
        </div>
        <div className="md:col-span-3">
          <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
            Location
          </label>
          <Input
            name="location"
            placeholder="City or region"
            defaultValue={location}
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
            Type
          </label>
          <select
            name="type"
            defaultValue={employmentType}
            className="flex h-11 w-full rounded-[6px] border border-[var(--line)] bg-[var(--paper)] px-3 text-sm"
          >
            <option value="">Any</option>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>
        <label className="flex h-11 items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" name="remote" value="1" defaultChecked={remote} />
          Remote only
        </label>
        <Button type="submit" className="md:col-span-1">
          Search
        </Button>
      </form>

      <p className="mt-6 text-sm text-[var(--muted)]">
        {ranked.length} {ranked.length === 1 ? "role" : "roles"}
      </p>

      {ranked.length === 0 ? (
        <div className="surface-card mt-4 px-6 py-14 text-center">
          <p className="font-display text-2xl font-semibold">
            {hasFilters ? "No roles match those filters" : "No open roles yet"}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
            {hasFilters
              ? "Try a broader search or clear a filter."
              : "When companies publish jobs, they’ll show up here."}
          </p>
          {!hasFilters ? (
            <Link href="/signup?intent=employer" className="mt-6 inline-block">
              <Button>Post a job</Button>
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ranked.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}

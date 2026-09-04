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
  const experience = one(params.experience) || "";

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
  if (experience) filters.push(ilike(jobs.experienceLevel, `%${experience}%`));
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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2 border-b border-[var(--line)] pb-6">
        <h1 className="font-display text-3xl font-medium tracking-tight">
          Job board
        </h1>
        <p className="text-[var(--muted)]">
          Search by keyword, location, and work type.
        </p>
      </div>

      <form className="mt-6 grid gap-3 border border-[var(--line)] bg-[var(--fog)] p-4 md:grid-cols-6">
        <Input
          name="q"
          placeholder="Keyword"
          defaultValue={q}
          className="md:col-span-2"
        />
        <Input name="location" placeholder="Location" defaultValue={location} />
        <select
          name="type"
          defaultValue={employmentType}
          className="h-10 border border-[var(--line)] bg-[var(--paper)] px-3 text-sm"
        >
          <option value="">Employment type</option>
          <option value="full_time">Full time</option>
          <option value="part_time">Part time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="remote" value="1" defaultChecked={remote} />
          Remote only
        </label>
        <button
          type="submit"
          className="h-10 bg-[var(--primary)] px-4 text-sm text-white"
        >
          Filter
        </button>
      </form>

      <p className="mt-4 font-mono-data text-xs text-[var(--muted)]">
        {ranked.length} {ranked.length === 1 ? "role" : "roles"}
      </p>

      <div className="mt-4 grid gap-3">
        {ranked.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
        {ranked.length === 0 ? (
          <div className="border border-[var(--line)] bg-[var(--fog)] p-8 text-center">
            <p className="font-display text-lg">
              {q || location || remote || employmentType
                ? "No roles match"
                : "No open roles yet"}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {q || location || remote || employmentType
                ? "Try clearing filters or searching something broader."
                : "Employers can publish jobs from their dashboard."}
            </p>
            {!(q || location || remote || employmentType) ? (
              <Link href="/signup" className="mt-5 inline-block">
                <Button>Hire on RoleCall</Button>
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

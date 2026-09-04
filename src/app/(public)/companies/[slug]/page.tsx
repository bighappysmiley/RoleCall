import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { companies, jobs } from "@/lib/db/schema";
import { JobCard } from "@/components/jobs/job-card";
import { rankJobs } from "@/lib/ranking";
import type { SubscriptionTier } from "@/lib/plans";

export const dynamic = "force-dynamic";

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = (
    await db.select().from(companies).where(eq(companies.slug, slug)).limit(1)
  )[0];
  if (!company) notFound();

  const openJobs = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.companyId, company.id), eq(jobs.status, "published")));

  const ranked = rankJobs(
    openJobs.map((j) => ({
      id: j.id,
      title: j.title,
      slug: j.slug,
      description: j.description,
      skills: j.skills ?? [],
      publishedAt: j.publishedAt,
      promotedUntil: j.promotedUntil,
      promotionSpendCents: j.promotionSpendCents,
      location: j.location,
      workplaceType: j.workplaceType,
      employmentType: j.employmentType,
      salaryMin: j.salaryMin,
      salaryMax: j.salaryMax,
      showSalary: j.showSalary,
      companyName: company.name,
      companySlug: company.slug,
      subscriptionTier: company.subscriptionTier as SubscriptionTier,
      overrideTier: company.overrideTier,
      overrideBoost: company.overrideBoost,
    }))
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="border border-[var(--line)] bg-[var(--fog)] p-6 md:p-8">
        <p className="font-mono-data text-xs uppercase tracking-wider text-[var(--muted)]">
          {company.industry || "Company"}
        </p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight">
          {company.name}
        </h1>
        {company.tagline ? (
          <p className="mt-2 text-lg text-[var(--muted)]">{company.tagline}</p>
        ) : null}
        {company.description ? (
          <p className="mt-4 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]">
            {company.description}
          </p>
        ) : null}
        {company.website ? (
          <Link
            href={company.website}
            className="mt-4 inline-block text-sm text-[var(--primary)] hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Visit website
          </Link>
        ) : null}
      </div>

      <h2 className="mt-10 font-display text-2xl font-medium">Open roles</h2>
      <div className="mt-4 grid gap-3">
        {ranked.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
        {ranked.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No open roles right now.</p>
        ) : null}
      </div>
    </div>
  );
}

import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { JobCard } from "@/components/jobs/job-card";
import { db } from "@/lib/db";
import { companies, jobs } from "@/lib/db/schema";
import { rankJobs } from "@/lib/ranking";
import type { SubscriptionTier } from "@/lib/plans";
import { colorFromString, initials } from "@/lib/format";

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
      salaryPeriod: j.salaryPeriod,
      companyName: company.name,
      companySlug: company.slug,
      subscriptionTier: company.subscriptionTier as SubscriptionTier,
      overrideTier: company.overrideTier,
      overrideBoost: company.overrideBoost,
    }))
  );

  const markColor = colorFromString(company.name);
  const locations = (company.locations as string[] | null) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
      <div className="surface-card overflow-hidden">
        <div
          className="h-36 w-full sm:h-44"
          style={{
            background: `linear-gradient(135deg, ${markColor} 0%, color-mix(in srgb, ${markColor} 50%, white) 100%)`,
          }}
        />
        <div className="px-6 pb-8 pt-0 sm:px-8">
          <div
            className="-mt-10 flex h-20 w-20 items-center justify-center rounded-[8px] border-[3px] border-[var(--paper)] text-xl font-semibold text-white"
            style={{ background: markColor }}
          >
            {initials(company.name)}
          </div>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">
            {company.name}
          </h1>
          {company.tagline ? (
            <p className="mt-2 text-lg text-[var(--muted)]">{company.tagline}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {company.industry ? (
              <span className="skill-chip">{company.industry}</span>
            ) : null}
            {locations.slice(0, 3).map((loc) => (
              <span key={loc} className="skill-chip">
                {loc}
              </span>
            ))}
            {(company.techStack ?? []).slice(0, 6).map((skill) => (
              <span key={skill} className="skill-chip">
                {skill}
              </span>
            ))}
          </div>
          {company.description ? (
            <p className="mt-6 max-w-3xl whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--muted)]">
              {company.description}
            </p>
          ) : null}
          {company.website ? (
            <Link
              href={company.website}
              className="mt-4 inline-block text-sm font-medium text-[var(--primary)] hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Visit website
            </Link>
          ) : null}
        </div>
      </div>

      <h2 className="mt-10 font-display text-2xl font-semibold">Open roles</h2>
      {ranked.length === 0 ? (
        <div className="surface-card mt-4 px-6 py-10 text-center text-sm text-[var(--muted)]">
          No open roles right now.
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

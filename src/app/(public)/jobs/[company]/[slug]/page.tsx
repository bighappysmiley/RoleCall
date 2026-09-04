import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { companies, jobs } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import {
  colorFromString,
  formatEmployment,
  formatSalaryRange,
  formatWorkplace,
  initials,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ company: string; slug: string }>;
}) {
  const { company: companySlug, slug } = await params;

  const rows = await db
    .select({
      job: jobs,
      company: companies,
    })
    .from(jobs)
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .where(and(eq(companies.slug, companySlug), eq(jobs.slug, slug)))
    .limit(1);

  const row = rows[0];
  if (!row || row.job.status !== "published") notFound();

  const { job, company } = row;
  const salary = job.showSalary
    ? formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryPeriod ?? "year")
    : null;
  const markColor = colorFromString(company.name);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-12">
      <div className="surface-card overflow-hidden">
        <div
          className="h-32 w-full sm:h-40"
          style={{
            background: `linear-gradient(135deg, ${markColor} 0%, color-mix(in srgb, ${markColor} 50%, white) 100%)`,
          }}
        />
        <div className="relative px-6 pb-8 pt-0 sm:px-8">
          <div
            className="-mt-10 flex h-20 w-20 items-center justify-center rounded-[20px] border-[4px] border-[var(--paper)] text-xl font-semibold text-white"
            style={{ background: markColor }}
          >
            {initials(company.name)}
          </div>
          <Link
            href={`/companies/${company.slug}`}
            className="mt-4 inline-block text-sm font-medium text-[var(--primary)] hover:underline"
          >
            {company.name}
          </Link>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            {job.title}
          </h1>
          {salary ? (
            <p className="mt-3 font-display text-2xl font-semibold">{salary}</p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="skill-chip">
              {job.location || "Flexible location"}
            </span>
            <span className="skill-chip">
              {formatWorkplace(job.workplaceType)}
            </span>
            <span className="skill-chip">
              {formatEmployment(job.employmentType)}
            </span>
            {(job.skills ?? []).map((skill) => (
              <span key={skill} className="skill-chip">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="font-display text-2xl font-semibold">About the role</h2>
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--muted)]">
            {job.description}
          </p>
        </section>
        {job.responsibilities ? (
          <section>
            <h2 className="font-display text-2xl font-semibold">
              Responsibilities
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--muted)]">
              {job.responsibilities}
            </p>
          </section>
        ) : null}
        {job.requirements ? (
          <section>
            <h2 className="font-display text-2xl font-semibold">Requirements</h2>
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--muted)]">
              {job.requirements}
            </p>
          </section>
        ) : null}
      </div>

      <div className="surface-card mt-10 p-6 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-xl font-semibold">Ready to apply?</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Create an account to submit your application, or sign in if you
            already have one.
          </p>
        </div>
        <div className="mt-4 flex gap-3 sm:mt-0">
          <Link href="/signup">
            <Button>Apply now</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary">Sign in</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

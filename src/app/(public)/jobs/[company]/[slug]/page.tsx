import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { companies, jobs } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="font-mono-data text-xs text-[var(--muted)]">
        <Link href={`/companies/${company.slug}`} className="hover:text-[var(--ink)]">
          {company.name}
        </Link>
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium tracking-tight">
        {job.title}
      </h1>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono-data text-xs text-[var(--muted)]">
        <span>{job.location || "Flexible"}</span>
        <span>{job.workplaceType}</span>
        <span>{job.employmentType.replaceAll("_", " ")}</span>
        {job.showSalary && (job.salaryMin || job.salaryMax) ? (
          <span>
            {job.salaryMin ? `$${job.salaryMin.toLocaleString()}` : "—"}
            {" – "}
            {job.salaryMax ? `$${job.salaryMax.toLocaleString()}` : "—"}
          </span>
        ) : null}
      </div>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-medium">About the role</h2>
          <p className="mt-2 whitespace-pre-wrap text-[var(--muted)]">
            {job.description}
          </p>
        </section>
        {job.responsibilities ? (
          <section>
            <h2 className="font-display text-xl font-medium">Responsibilities</h2>
            <p className="mt-2 whitespace-pre-wrap text-[var(--muted)]">
              {job.responsibilities}
            </p>
          </section>
        ) : null}
        {job.requirements ? (
          <section>
            <h2 className="font-display text-xl font-medium">Requirements</h2>
            <p className="mt-2 whitespace-pre-wrap text-[var(--muted)]">
              {job.requirements}
            </p>
          </section>
        ) : null}
        {job.skills?.length ? (
          <section>
            <h2 className="font-display text-xl font-medium">Skills</h2>
            <p className="mt-2 font-mono-data text-sm text-[var(--muted)]">
              {job.skills.join(" · ")}
            </p>
          </section>
        ) : null}
      </div>

      <div className="mt-10 border border-[var(--line)] bg-[var(--fog)] p-5">
        <p className="font-display text-lg">Ready to apply?</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Create a candidate account or log in to send your application.
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/signup">
            <Button>Apply with RoleCall</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary">Log in</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

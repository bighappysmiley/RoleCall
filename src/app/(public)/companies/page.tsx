import Link from "next/link";
import { eq } from "drizzle-orm";
import { CompanyCard } from "@/components/companies/company-card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { companies, jobs } from "@/lib/db/schema";
import { formatSalaryRange } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const rows = await db.select().from(companies).orderBy(companies.name);

  const publishedJobs = await db
    .select({
      companyId: jobs.companyId,
      salaryMin: jobs.salaryMin,
      salaryMax: jobs.salaryMax,
      showSalary: jobs.showSalary,
      skills: jobs.skills,
      location: jobs.location,
    })
    .from(jobs)
    .where(eq(jobs.status, "published"));

  const byCompany = new Map<
    string,
    {
      count: number;
      mins: number[];
      maxs: number[];
      skills: string[];
      locations: string[];
    }
  >();

  for (const job of publishedJobs) {
    const entry = byCompany.get(job.companyId) ?? {
      count: 0,
      mins: [],
      maxs: [],
      skills: [],
      locations: [],
    };
    entry.count += 1;
    if (job.showSalary && job.salaryMin != null) entry.mins.push(job.salaryMin);
    if (job.showSalary && job.salaryMax != null) entry.maxs.push(job.salaryMax);
    for (const skill of job.skills ?? []) {
      if (!entry.skills.includes(skill)) entry.skills.push(skill);
    }
    if (job.location && !entry.locations.includes(job.location)) {
      entry.locations.push(job.location);
    }
    byCompany.set(job.companyId, entry);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Companies hiring now
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          Explore teams on RoleCall — see open roles, pay ranges, and focus
          areas at a glance.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="surface-card mt-10 px-6 py-14 text-center">
          <p className="font-display text-2xl font-semibold">No companies yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
            Create an employer account to add your company and start hiring.
          </p>
          <Link href="/signup?intent=employer" className="mt-6 inline-block">
            <Button>Start hiring</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((company) => {
            const stats = byCompany.get(company.id);
            const locations =
              (company.locations as string[] | null)?.filter(Boolean) ??
              stats?.locations ??
              [];
            const min = stats?.mins.length
              ? Math.min(...stats.mins)
              : null;
            const max = stats?.maxs.length
              ? Math.max(...stats.maxs)
              : null;
            const salaryLabel = formatSalaryRange(min, max);

            return (
              <CompanyCard
                key={company.id}
                slug={company.slug}
                name={company.name}
                tagline={company.tagline}
                industry={company.industry}
                locationLabel={locations[0] ?? null}
                openRoles={stats?.count ?? 0}
                salaryLabel={salaryLabel ? `From ${salaryLabel}` : null}
                skills={stats?.skills ?? company.techStack ?? []}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

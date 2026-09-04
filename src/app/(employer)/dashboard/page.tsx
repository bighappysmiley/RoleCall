import Link from "next/link";
import { eq } from "drizzle-orm";
import { getCurrentProfile } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { companyMembers, companies, jobs, applications } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import { colorFromString, initials } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");
  if (current.profile.accountType !== "employer") redirect("/profile");

  const memberships = await db
    .select({
      company: companies,
      role: companyMembers.role,
    })
    .from(companyMembers)
    .innerJoin(companies, eq(companyMembers.companyId, companies.id))
    .where(eq(companyMembers.userId, current.profile.id));

  const companyIds = memberships.map((m) => m.company.id);
  let jobCount = 0;
  let appCount = 0;
  if (companyIds.length) {
    const jobRows = await db
      .select({ id: jobs.id, companyId: jobs.companyId })
      .from(jobs);
    const companyJobs = jobRows.filter((j) => companyIds.includes(j.companyId));
    jobCount = companyJobs.length;
    if (companyJobs.length) {
      const apps = await db
        .select({ id: applications.id, jobId: applications.jobId })
        .from(applications);
      const jobIdSet = new Set(companyJobs.map((j) => j.id));
      appCount = apps.filter((a) => jobIdSet.has(a.jobId)).length;
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
        Dashboard
      </h1>
      <p className="mt-2 text-[var(--muted)]">
        Welcome back, {current.profile.fullName}.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Companies", value: memberships.length },
          { label: "Jobs", value: jobCount },
          { label: "Applicants", value: appCount },
        ].map((stat) => (
          <div key={stat.label} className="surface-card p-5">
            <p className="text-sm text-[var(--muted)]">{stat.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold">Your companies</h2>
          <Link href="/pricing">
            <Button variant="secondary" size="sm">
              View plans
            </Button>
          </Link>
        </div>
        {memberships.length === 0 ? (
          <div className="surface-card mt-4 px-6 py-12 text-center">
            <p className="font-display text-xl font-semibold">
              Create your company profile
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
              Set up your company to post roles and review applicants.
            </p>
            <Link href="/companies" className="mt-5 inline-block">
              <Button variant="secondary">Browse companies</Button>
            </Link>
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {memberships.map(({ company, role }) => {
              const tone = colorFromString(company.name);
              return (
                <li key={company.id} className="surface-card overflow-hidden">
                  <div
                    className="h-20"
                    style={{
                      background: `linear-gradient(135deg, ${tone}, color-mix(in srgb, ${tone} 50%, white))`,
                    }}
                  />
                  <div className="relative px-5 pb-5">
                    <div
                      className="-mt-6 flex h-12 w-12 items-center justify-center rounded-[6px] border-2 border-[var(--paper)] text-sm font-semibold text-white"
                      style={{ background: tone }}
                    >
                      {initials(company.name)}
                    </div>
                    <p className="mt-3 font-display text-lg font-semibold">
                      {company.name}
                    </p>
                    <p className="text-sm capitalize text-[var(--muted)]">
                      {role.replaceAll("_", " ")}
                    </p>
                    <Link
                      href={`/companies/${company.slug}`}
                      className="mt-3 inline-block text-sm font-medium text-[var(--primary)] hover:underline"
                    >
                      View profile
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

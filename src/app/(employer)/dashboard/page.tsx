import Link from "next/link";
import { eq } from "drizzle-orm";
import { getCurrentProfile } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { companyMembers, companies, jobs, applications } from "@/lib/db/schema";
import { redirect } from "next/navigation";

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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-medium tracking-tight">
        Dashboard
      </h1>
      <p className="mt-2 text-[var(--muted)]">
        Welcome back, {current.profile.fullName}.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="border border-[var(--line)] bg-[var(--fog)] p-4">
          <p className="font-mono-data text-xs text-[var(--muted)]">Companies</p>
          <p className="mt-2 font-mono-data text-3xl">{memberships.length}</p>
        </div>
        <div className="border border-[var(--line)] bg-[var(--fog)] p-4">
          <p className="font-mono-data text-xs text-[var(--muted)]">Jobs</p>
          <p className="mt-2 font-mono-data text-3xl">{jobCount}</p>
        </div>
        <div className="border border-[var(--line)] bg-[var(--fog)] p-4">
          <p className="font-mono-data text-xs text-[var(--muted)]">Applicants</p>
          <p className="mt-2 font-mono-data text-3xl">{appCount}</p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-medium">Your companies</h2>
        {memberships.length === 0 ? (
          <div className="mt-4 border border-[var(--line)] bg-[var(--paper)] p-6">
            <p className="font-display text-lg">Create your company profile</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Set up your company to post roles and review applicants.
            </p>
            <Link href="/companies" className="mt-4 inline-block">
              <Button variant="secondary">Browse companies</Button>
            </Link>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3">
            {memberships.map(({ company, role }) => (
              <li
                key={company.id}
                className="flex items-center justify-between border border-[var(--line)] p-4"
              >
                <div>
                  <p className="font-display text-lg">{company.name}</p>
                  <p className="font-mono-data text-xs text-[var(--muted)]">
                    {role}
                  </p>
                </div>
                <Link
                  href={`/companies/${company.slug}`}
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  View profile
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

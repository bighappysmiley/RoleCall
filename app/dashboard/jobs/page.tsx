import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { requireEmployerCompany } from "@/lib/dashboard";
import { isPast } from "@/lib/form";
import { formatJobStatus, formatShortDate } from "@/lib/format";
import { canManageJobs } from "@/lib/permissions";
import { companyPlan } from "@/lib/plans";
import { countPublishedJobs, listCompanyJobRecords } from "@/lib/queries";

export const metadata: Metadata = { title: "Jobs" };
export const dynamic = "force-dynamic";

export default async function DashboardJobsPage() {
  const { company, access } = await requireEmployerCompany();
  if (!company || !access) {
    redirect("/dashboard/company");
  }

  const [jobs, published] = await Promise.all([
    listCompanyJobRecords(company.id),
    countPublishedJobs(company.id),
  ]);
  const plan = companyPlan(company.subscriptionTier, company.overrideTier);
  const canWrite = canManageJobs(access);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
            JOBS
          </p>
          <h1 className="mt-2 font-heading text-4xl">Roles</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {published} published
            {plan.activeJobs === "unlimited"
              ? ""
              : ` of ${plan.activeJobs} on ${plan.name}`}
            . Drafts stay private.
          </p>
        </div>
        {canWrite ? (
          <Button asChild>
            <Link href="/dashboard/jobs/new">New job</Link>
          </Button>
        ) : null}
      </div>
      {jobs.length === 0 ? (
        <p className="mt-8 border border-line bg-fog px-4 py-6 text-sm text-muted-foreground">
          No jobs yet. Create a draft, then publish when you are ready.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-line border border-line">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <Link
                  href={`/dashboard/jobs/${job.id}`}
                  className="font-heading text-lg hover:underline"
                >
                  {job.title}
                </Link>
                <p className="font-mono text-[11px] tracking-wider text-muted-foreground">
                  {formatJobStatus(job.status).toUpperCase()}
                  {job.applicationCount
                    ? ` · ${job.applicationCount} APPS`
                    : ""}
                  {job.promotedUntil && !isPast(job.promotedUntil)
                    ? ` · PROMOTED UNTIL ${formatShortDate(job.promotedUntil).toUpperCase()}`
                    : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/dashboard/jobs/${job.id}`}>Edit</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/dashboard/jobs/${job.id}/pipeline`}>Pipeline</Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

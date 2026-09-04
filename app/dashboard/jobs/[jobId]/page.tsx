import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { JobForm } from "@/components/job-form";
import { PromoteJobForm } from "@/components/promote-job-form";
import { DeleteJobForm } from "@/components/delete-forms";
import { Button } from "@/components/ui/button";
import { requireEmployerCompany } from "@/lib/dashboard";
import { isPast } from "@/lib/form";
import { canManageJobs } from "@/lib/permissions";
import { getJobById } from "@/lib/queries";

type Params = { jobId: string };

export const metadata: Metadata = { title: "Edit job" };
export const dynamic = "force-dynamic";

export default async function EditJobPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { jobId } = await params;
  const { company, access } = await requireEmployerCompany();
  if (!company || !access) {
    redirect("/dashboard/company");
  }

  const job = await getJobById(jobId);
  if (!job || job.companyId !== company.id) {
    notFound();
  }

  const canWrite = canManageJobs(access);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
        EDIT JOB
      </p>
      <div className="mt-2 mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-heading text-4xl">{job.title}</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href={`/dashboard/jobs/${job.id}/pipeline`}>Pipeline</Link>
          </Button>
          {job.status === "published" ? (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/jobs/${job.company.slug}/${job.slug}`}>Public page</Link>
            </Button>
          ) : null}
        </div>
      </div>
      <JobForm companyId={company.id} job={job} readOnly={!canWrite} />
      {canWrite ? (
        <PromoteJobForm
          jobId={job.id}
          balanceCents={company.adCreditBalanceCents}
          promotedUntil={job.promotedUntil}
          published={job.status === "published"}
          active={Boolean(job.promotedUntil) && !isPast(job.promotedUntil)}
        />
      ) : null}
      {canWrite ? <DeleteJobForm jobId={job.id} /> : null}
    </div>
  );
}

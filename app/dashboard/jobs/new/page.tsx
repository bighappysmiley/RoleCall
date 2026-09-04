import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { JobForm } from "@/components/job-form";
import { requireEmployerCompany } from "@/lib/dashboard";
import { canManageJobs } from "@/lib/permissions";

export const metadata: Metadata = { title: "New job" };
export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  const { company, access } = await requireEmployerCompany();
  if (!company || !access) {
    redirect("/dashboard/company");
  }
  if (!canManageJobs(access)) {
    redirect("/dashboard/jobs");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
        NEW JOB
      </p>
      <h1 className="mt-2 mb-8 font-heading text-4xl">Post a role</h1>
      <JobForm companyId={company.id} />
    </div>
  );
}

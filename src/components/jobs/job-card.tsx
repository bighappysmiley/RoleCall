import Link from "next/link";
import type { RankedJob, RankableJob } from "@/lib/ranking";

type JobCardJob = RankedJob<
  RankableJob & {
    slug: string;
    companySlug: string;
    location: string | null;
    workplaceType: string;
    employmentType: string;
    salaryMin: number | null;
    salaryMax: number | null;
    showSalary: boolean;
  }
>;

function formatSalary(job: JobCardJob) {
  if (!job.showSalary || (job.salaryMin == null && job.salaryMax == null)) {
    return "Salary not listed";
  }
  const min = job.salaryMin != null ? `$${(job.salaryMin / 1000).toFixed(0)}k` : "";
  const max = job.salaryMax != null ? `$${(job.salaryMax / 1000).toFixed(0)}k` : "";
  if (min && max) return `${min}–${max}`;
  return min || max;
}

function placementLabel(placement: JobCardJob["placement"]) {
  if (placement === "featured") return "FEATURED";
  if (placement === "promoted") return "PROMOTED";
  return null;
}

export function JobCard({ job }: { job: JobCardJob }) {
  const label = placementLabel(job.placement);
  return (
    <article
      className="promotion-rail border border-[var(--line)] bg-[var(--paper)]"
      data-placement={job.placement === "organic" ? undefined : job.placement}
    >
      <Link
        href={`/jobs/${job.companySlug}/${job.slug}`}
        className="block p-4 pl-5 hover:bg-[var(--fog)]"
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-medium tracking-tight text-[var(--ink)]">
              {job.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{job.companyName}</p>
          </div>
          {label ? (
            <span className="placement-tab font-mono-data" style={{ display: "inline-flex" }}>
              {label}
            </span>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono-data text-xs text-[var(--muted)]">
          <span>{job.location || "Location flexible"}</span>
          <span>{job.workplaceType}</span>
          <span>{job.employmentType.replace("_", " ")}</span>
          <span>{formatSalary(job)}</span>
        </div>
      </Link>
    </article>
  );
}

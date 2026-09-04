import Link from "next/link";
import type { RankedJob, RankableJob } from "@/lib/ranking";
import {
  colorFromString,
  formatEmployment,
  formatSalaryRange,
  formatWorkplace,
  initials,
} from "@/lib/format";

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
    salaryPeriod?: string | null;
  }
>;

export function JobCard({ job }: { job: JobCardJob }) {
  const salary = job.showSalary
    ? formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryPeriod ?? "year")
    : null;
  const markColor = colorFromString(job.companyName);
  const promoted =
    job.placement === "featured" || job.placement === "promoted";

  return (
    <article className="surface-card surface-card-lift overflow-hidden transition-all duration-200">
      <Link href={`/jobs/${job.companySlug}/${job.slug}`} className="block">
        <div
          className="relative h-28 w-full"
          style={{
            background: `linear-gradient(135deg, ${markColor} 0%, color-mix(in srgb, ${markColor} 50%, white) 100%)`,
          }}
        >
          {promoted ? (
            <span className="badge badge-promoted absolute left-3 top-3 bg-white/95">
              {job.placement === "featured" ? "Featured" : "Promoted"}
            </span>
          ) : null}
        </div>
        <div className="relative px-5 pb-5 pt-0">
          <div
            className="-mt-7 flex h-14 w-14 items-center justify-center rounded-[8px] border-2 border-[var(--paper)] text-sm font-semibold text-white"
            style={{ background: markColor }}
            aria-hidden
          >
            {initials(job.companyName)}
          </div>
          <h2 className="mt-3 font-display text-lg font-semibold tracking-tight text-[var(--ink)] line-clamp-2">
            {job.title}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{job.companyName}</p>
          {salary ? (
            <p className="mt-3 font-display text-xl font-semibold text-[var(--ink)]">
              {salary}
            </p>
          ) : (
            <p className="mt-3 text-sm font-medium text-[var(--muted)]">
              Compensation shared on apply
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="skill-chip">
              {job.location || "Flexible"}
            </span>
            <span className="skill-chip">
              {formatWorkplace(job.workplaceType)}
            </span>
            <span className="skill-chip">
              {formatEmployment(job.employmentType)}
            </span>
            {(job.skills ?? []).slice(0, 2).map((skill) => (
              <span key={skill} className="skill-chip">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </article>
  );
}

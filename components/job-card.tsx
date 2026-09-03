import Link from "next/link";
import { CompanyMark } from "@/components/company-mark";
import { PromotionRail } from "@/components/promotion-rail";
import { formatEmployment, formatPostedAt, formatSalary, formatWorkplace } from "@/lib/format";
import type { RankedJob } from "@/lib/types";
import { cn } from "@/lib/utils";

export function JobCard({ job }: { job: RankedJob }) {
  const salary = formatSalary({
    min: job.salaryMin,
    max: job.salaryMax,
    currency: job.salaryCurrency,
    period: job.salaryPeriod,
    show: job.showSalary,
  });

  return (
    <article
      className={cn(
        "relative border border-line bg-paper",
        job.rail !== "none" && "pl-1",
      )}
    >
      <PromotionRail rail={job.rail} />
      <Link
        href={`/jobs/${job.company.slug}/${job.slug}`}
        className="block px-4 py-4 sm:px-5"
      >
        <div className="flex items-start gap-3">
          <CompanyMark name={job.company.name} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h2 className="font-heading text-lg font-medium tracking-[-0.03em]">
                {job.title}
              </h2>
              {job.company.isVerified ? (
                <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                  VERIFIED
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {job.company.name}
              {job.location ? ` · ${job.location}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] tracking-wide text-muted-foreground">
              <span>{formatEmployment(job.employmentType)}</span>
              <span>{formatWorkplace(job.workplaceType)}</span>
              {salary ? <span>{salary}</span> : null}
              <span>{formatPostedAt(job.publishedAt)}</span>
            </div>
            {job.skills.length > 0 ? (
              <p className="mt-2 truncate text-sm text-ink/80">
                {job.skills.slice(0, 4).join(" · ")}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}

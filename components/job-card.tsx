import Link from "next/link";
import { NameWithBadge } from "@/components/badge-icon";
import { CompanyMark } from "@/components/company-mark";
import { PromotionRail } from "@/components/promotion-rail";
import {
  formatEmployment,
  formatPostedAt,
  formatSalary,
  formatWorkplace,
} from "@/lib/format";
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
        "relative border border-line bg-white/90 transition-colors hover:border-primary/25 hover:bg-white",
        job.rail !== "none" && "pl-1",
      )}
    >
      <PromotionRail rail={job.rail} />
      <Link
        href={`/jobs/${job.company.slug}/${job.slug}`}
        className="block px-4 py-4 sm:px-5"
      >
        <div className="flex items-start gap-3">
          <CompanyMark name={job.company.name} logoUrl={job.company.logoUrl} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h2 className="font-display text-lg font-medium tracking-[-0.03em]">
                {job.title}
              </h2>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              <NameWithBadge
                name={job.company.name}
                badge={job.company.pinnedBadge}
                badgeSize={14}
              />
              {job.location ? (
                <span>{` · ${job.location}`}</span>
              ) : null}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
              <span>{formatEmployment(job.employmentType)}</span>
              <span>{formatWorkplace(job.workplaceType)}</span>
              {salary ? <span>{salary}</span> : null}
              <span>{formatPostedAt(job.publishedAt)}</span>
            </div>
            {job.skills.length > 0 ? (
              <p className="mt-2 truncate text-sm text-ink/75">
                {job.skills.slice(0, 4).join(" · ")}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}

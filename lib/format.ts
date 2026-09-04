import type {
  ApplicationStage,
  EmploymentType,
  JobStatus,
  MemberRole,
  WorkplaceType,
} from "@/lib/types";

const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
};

const WORKPLACE_LABELS: Record<WorkplaceType, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

export function formatEmployment(type: EmploymentType): string {
  return EMPLOYMENT_LABELS[type];
}

export function formatWorkplace(type: WorkplaceType): string {
  return WORKPLACE_LABELS[type];
}

const STAGE_LABELS: Record<ApplicationStage, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
};

const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: "Draft",
  published: "Published",
  paused: "Paused",
  closed: "Closed",
};

export function formatStage(stage: ApplicationStage): string {
  return STAGE_LABELS[stage];
}

export function formatJobStatus(status: JobStatus): string {
  return JOB_STATUS_LABELS[status];
}

export function formatSalary(options: {
  min: number | null;
  max: number | null;
  currency: string;
  period: string;
  show: boolean;
}): string | null {
  if (!options.show || (options.min == null && options.max == null)) {
    return null;
  }

  const currency = options.currency || "USD";
  const format = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(cents / 100);

  const period =
    options.period === "year"
      ? "yr"
      : options.period === "month"
        ? "mo"
        : options.period;

  if (options.min != null && options.max != null) {
    return `${format(options.min)}–${format(options.max)} / ${period}`;
  }
  if (options.min != null) {
    return `From ${format(options.min)} / ${period}`;
  }
  if (options.max != null) {
    return `Up to ${format(options.max)} / ${period}`;
  }
  return null;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatPostedAt(date: Date | null): string {
  if (!date) {
    return "Date unknown";
  }
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) {
    return "Today";
  }
  if (days === 1) {
    return "Yesterday";
  }
  if (days < 14) {
    return `${days}d ago`;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatRole(role: MemberRole): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatShortDate(date: Date | null): string {
  if (!date) {
    return "—";
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

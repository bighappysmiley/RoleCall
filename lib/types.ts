export type AccountType = "candidate" | "employer";

export type SubscriptionTier = "free" | "pro" | "pro_plus" | "enterprise";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "internship";

export type WorkplaceType = "remote" | "hybrid" | "onsite";

export type JobStatus = "draft" | "published" | "paused" | "closed";

export type PromotionTier = "none" | "credits" | "tier";

export type ApplicationStage =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

export type MemberRole = "owner" | "admin" | "recruiter" | "viewer";

export type MemberStatus = "active" | "invited" | "removed";

export const APPLICATION_STAGES: ApplicationStage[] = [
  "applied",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected",
];

export const EMPLOYMENT_TYPES: EmploymentType[] = [
  "full_time",
  "part_time",
  "contract",
  "internship",
];

export const WORKPLACE_TYPES: WorkplaceType[] = [
  "remote",
  "hybrid",
  "onsite",
];

export const JOB_STATUSES: JobStatus[] = [
  "draft",
  "published",
  "paused",
  "closed",
];

export type JobBoardFilters = {
  q?: string;
  type?: EmploymentType;
  workplace?: WorkplaceType;
  location?: string;
};

export type ProfileLinks = {
  website?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
};

export type CompanySocialLinks = {
  linkedin?: string;
  twitter?: string;
  github?: string;
};

export type CompanyRecord = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  industry: string | null;
  sizeRange: string | null;
  foundedYear: number | null;
  locations: string[];
  techStack: string[];
  benefits: string[];
  socialLinks: CompanySocialLinks;
  isVerified: boolean;
  subscriptionTier: SubscriptionTier;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: Date | null;
  adCreditBalanceCents: number;
  overrideTier: SubscriptionTier | null;
  overrideBoost: boolean;
};

export type JobRecord = {
  id: string;
  companyId: string;
  title: string;
  slug: string;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  department: string | null;
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salaryPeriod: string;
  showSalary: boolean;
  skills: string[];
  experienceLevel: string | null;
  status: JobStatus;
  publishedAt: Date | null;
  closesAt: Date | null;
  promotionTier: PromotionTier;
  promotedUntil: Date | null;
  promotionSpendCents: number;
  viewCount: number;
  applicationCount: number;
};

export type JobWithCompany = JobRecord & {
  company: CompanyRecord;
};

export type RailKind = "none" | "pro" | "promoted" | "featured";

export type RankedJob = JobWithCompany & {
  featuredRank: number;
  promotedRank: number;
  score: number;
  rail: RailKind;
};

export type ProfileRecord = {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  accountType: AccountType | null;
  headline: string | null;
  location: string | null;
  bio: string | null;
  links: ProfileLinks;
  isPlatformAdmin: boolean;
};

import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const accountTypeEnum = pgEnum("account_type", ["candidate", "employer"]);
export const memberRoleEnum = pgEnum("member_role", [
  "owner",
  "admin",
  "recruiter",
  "viewer",
]);
export const memberStatusEnum = pgEnum("member_status", [
  "active",
  "invited",
  "removed",
]);
export const employmentTypeEnum = pgEnum("employment_type", [
  "full_time",
  "part_time",
  "contract",
  "internship",
]);
export const workplaceTypeEnum = pgEnum("workplace_type", [
  "remote",
  "hybrid",
  "onsite",
]);
export const jobStatusEnum = pgEnum("job_status", [
  "draft",
  "published",
  "paused",
  "closed",
]);
export const promotionTierEnum = pgEnum("promotion_tier", [
  "none",
  "credits",
  "tier",
]);
export const applicationStageEnum = pgEnum("application_stage", [
  "applied",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected",
]);
export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "free",
  "pro",
  "pro_plus",
  "enterprise",
]);
export const ledgerReasonEnum = pgEnum("ledger_reason", [
  "purchase",
  "spend",
  "grant",
  "refund",
]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  fullName: text("full_name").notNull().default(""),
  avatarUrl: text("avatar_url"),
  accountType: accountTypeEnum("account_type").notNull().default("candidate"),
  headline: text("headline"),
  location: text("location"),
  bio: text("bio"),
  resumeUrl: text("resume_url"),
  links: jsonb("links").$type<Record<string, string>>().default({}),
  isPlatformAdmin: boolean("is_platform_admin").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 120 }).notNull(),
    name: text("name").notNull(),
    tagline: text("tagline"),
    description: text("description"),
    logoUrl: text("logo_url"),
    coverUrl: text("cover_url"),
    website: text("website"),
    industry: text("industry"),
    sizeRange: text("size_range"),
    foundedYear: integer("founded_year"),
    locations: jsonb("locations").$type<string[]>().default([]),
    techStack: text("tech_stack").array().default([]),
    benefits: jsonb("benefits").$type<string[]>().default([]),
    socialLinks: jsonb("social_links").$type<Record<string, string>>().default({}),
    isVerified: boolean("is_verified").notNull().default(false),
    subscriptionTier: subscriptionTierEnum("subscription_tier")
      .notNull()
      .default("free"),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    subscriptionStatus: text("subscription_status"),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    adCreditBalanceCents: integer("ad_credit_balance_cents").notNull().default(0),
    overrideTier: subscriptionTierEnum("override_tier"),
    overrideBoost: boolean("override_boost").notNull().default(false),
    customDomain: text("custom_domain"),
    customDomainVerified: boolean("custom_domain_verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("companies_slug_idx").on(t.slug)]
);

export const companyMembers = pgTable(
  "company_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
    role: memberRoleEnum("role").notNull().default("viewer"),
    status: memberStatusEnum("status").notNull().default("invited"),
    invitedEmail: text("invited_email"),
    inviteToken: text("invite_token"),
    inviteExpiresAt: timestamp("invite_expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("company_members_company_user_idx").on(t.companyId, t.userId)]
);

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: varchar("slug", { length: 160 }).notNull(),
    description: text("description").notNull().default(""),
    responsibilities: text("responsibilities"),
    requirements: text("requirements"),
    department: text("department"),
    employmentType: employmentTypeEnum("employment_type")
      .notNull()
      .default("full_time"),
    workplaceType: workplaceTypeEnum("workplace_type").notNull().default("remote"),
    location: text("location"),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    salaryCurrency: text("salary_currency").default("USD"),
    salaryPeriod: text("salary_period").default("year"),
    showSalary: boolean("show_salary").notNull().default(true),
    skills: text("skills").array().default([]),
    experienceLevel: text("experience_level"),
    status: jobStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    closesAt: timestamp("closes_at", { withTimezone: true }),
    promotionTier: promotionTierEnum("promotion_tier").notNull().default("none"),
    promotedUntil: timestamp("promoted_until", { withTimezone: true }),
    promotionSpendCents: integer("promotion_spend_cents").notNull().default(0),
    viewCount: integer("view_count").notNull().default(0),
    applicationCount: integer("application_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("jobs_company_slug_idx").on(t.companyId, t.slug)]
);

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    coverLetter: text("cover_letter"),
    resumeUrl: text("resume_url"),
    answers: jsonb("answers").$type<Record<string, unknown>>().default({}),
    stage: applicationStageEnum("stage").notNull().default("applied"),
    stageOrder: integer("stage_order").notNull().default(0),
    rating: smallint("rating"),
    source: text("source"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("applications_job_candidate_idx").on(t.jobId, t.candidateId)]
);

export const applicationNotes = pgTable("application_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const adCreditLedger = pgTable("ad_credit_ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  deltaCents: integer("delta_cents").notNull(),
  reason: ledgerReasonEnum("reason").notNull(),
  jobId: uuid("job_id").references(() => jobs.id, { onDelete: "set null" }),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const savedJobs = pgTable(
  "saved_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("saved_jobs_candidate_job_idx").on(t.candidateId, t.jobId)]
);

export const jobViews = pgTable("job_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  viewerId: uuid("viewer_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  referrer: text("referrer"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Profile = typeof profiles.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Application = typeof applications.$inferSelect;

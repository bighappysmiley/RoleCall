CREATE TYPE "public"."account_type" AS ENUM('candidate', 'employer');--> statement-breakpoint
CREATE TYPE "public"."application_stage" AS ENUM('applied', 'screening', 'interview', 'offer', 'hired', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."employment_type" AS ENUM('full_time', 'part_time', 'contract', 'internship');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('draft', 'published', 'paused', 'closed');--> statement-breakpoint
CREATE TYPE "public"."ledger_reason" AS ENUM('purchase', 'spend', 'grant', 'refund');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('owner', 'admin', 'recruiter', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."member_status" AS ENUM('active', 'invited', 'removed');--> statement-breakpoint
CREATE TYPE "public"."promotion_tier" AS ENUM('none', 'credits', 'tier');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('free', 'pro', 'pro_plus', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."workplace_type" AS ENUM('remote', 'hybrid', 'onsite');--> statement-breakpoint
CREATE TABLE "ad_credit_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"delta_cents" integer NOT NULL,
	"reason" "ledger_reason" NOT NULL,
	"job_id" uuid,
	"stripe_payment_intent_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"candidate_id" uuid NOT NULL,
	"cover_letter" text,
	"resume_url" text,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"stage" "application_stage" DEFAULT 'applied' NOT NULL,
	"stage_order" integer DEFAULT 0 NOT NULL,
	"rating" smallint,
	"source" text DEFAULT 'rolecall' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "applications_job_candidate_uidx" UNIQUE("job_id","candidate_id")
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"tagline" text,
	"description" text,
	"logo_url" text,
	"cover_url" text,
	"website" text,
	"industry" text,
	"size_range" text,
	"founded_year" integer,
	"locations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tech_stack" text[] DEFAULT '{}' NOT NULL,
	"benefits" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"social_links" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"subscription_tier" "subscription_tier" DEFAULT 'free' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"subscription_status" text,
	"current_period_end" timestamp with time zone,
	"ad_credit_balance_cents" integer DEFAULT 0 NOT NULL,
	"override_tier" "subscription_tier",
	"override_boost" boolean DEFAULT false NOT NULL,
	"custom_domain" text,
	"custom_domain_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "company_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "member_role" DEFAULT 'viewer' NOT NULL,
	"status" "member_status" DEFAULT 'invited' NOT NULL,
	"invited_email" text,
	"invite_token" text,
	"invite_expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "company_members_company_user_uidx" UNIQUE("company_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "job_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"viewer_id" uuid,
	"referrer" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"responsibilities" text,
	"requirements" text,
	"department" text,
	"employment_type" "employment_type" DEFAULT 'full_time' NOT NULL,
	"workplace_type" "workplace_type" DEFAULT 'remote' NOT NULL,
	"location" text,
	"salary_min" integer,
	"salary_max" integer,
	"salary_currency" text DEFAULT 'USD' NOT NULL,
	"salary_period" text DEFAULT 'year' NOT NULL,
	"show_salary" boolean DEFAULT true NOT NULL,
	"skills" text[] DEFAULT '{}' NOT NULL,
	"experience_level" text,
	"status" "job_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"closes_at" timestamp with time zone,
	"promotion_tier" "promotion_tier" DEFAULT 'none' NOT NULL,
	"promoted_until" timestamp with time zone,
	"promotion_spend_cents" integer DEFAULT 0 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"application_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_company_slug_uidx" UNIQUE("company_id","slug")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text,
	"avatar_url" text,
	"account_type" "account_type",
	"headline" text,
	"location" text,
	"bio" text,
	"resume_url" text,
	"links" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_platform_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"job_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_jobs_candidate_job_uidx" UNIQUE("candidate_id","job_id")
);
--> statement-breakpoint
ALTER TABLE "ad_credit_ledger" ADD CONSTRAINT "ad_credit_ledger_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_credit_ledger" ADD CONSTRAINT "ad_credit_ledger_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_notes" ADD CONSTRAINT "application_notes_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_notes" ADD CONSTRAINT "application_notes_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidate_id_profiles_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_views" ADD CONSTRAINT "job_views_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_views" ADD CONSTRAINT "job_views_viewer_id_profiles_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_candidate_id_profiles_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "applications_candidate_idx" ON "applications" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX "companies_slug_idx" ON "companies" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "company_members_user_idx" ON "company_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "job_views_job_idx" ON "job_views" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "jobs_status_published_idx" ON "jobs" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "jobs_company_idx" ON "jobs" USING btree ("company_id");
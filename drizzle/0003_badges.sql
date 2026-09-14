CREATE TABLE "badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon_data_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "badges_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "profile_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"badge_id" uuid NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"awarded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"badge_id" uuid NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"awarded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profile_badges" ADD CONSTRAINT "profile_badges_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "profile_badges" ADD CONSTRAINT "profile_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "profile_badges" ADD CONSTRAINT "profile_badges_awarded_by_profiles_id_fk" FOREIGN KEY ("awarded_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "company_badges" ADD CONSTRAINT "company_badges_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "company_badges" ADD CONSTRAINT "company_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "company_badges" ADD CONSTRAINT "company_badges_awarded_by_profiles_id_fk" FOREIGN KEY ("awarded_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "badges_slug_idx" ON "badges" USING btree ("slug");
--> statement-breakpoint
CREATE UNIQUE INDEX "profile_badges_profile_badge_uidx" ON "profile_badges" USING btree ("profile_id","badge_id");
--> statement-breakpoint
CREATE INDEX "profile_badges_profile_idx" ON "profile_badges" USING btree ("profile_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "company_badges_company_badge_uidx" ON "company_badges" USING btree ("company_id","badge_id");
--> statement-breakpoint
CREATE INDEX "company_badges_company_idx" ON "company_badges" USING btree ("company_id");

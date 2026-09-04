ALTER TABLE "company_members" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_invite_token_uidx" UNIQUE("invite_token");
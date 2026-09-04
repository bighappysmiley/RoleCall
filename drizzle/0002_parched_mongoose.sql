CREATE TABLE "stripe_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "ad_credit_ledger_company_idx" ON "ad_credit_ledger" USING btree ("company_id");--> statement-breakpoint
ALTER TABLE "ad_credit_ledger" ADD CONSTRAINT "ad_credit_ledger_payment_intent_uidx" UNIQUE("stripe_payment_intent_id");
import { and, desc, eq, isNotNull, lt, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { requireDb } from "@/lib/db";
import {
  adCreditLedger,
  companies,
  jobs,
  stripeEvents,
} from "@/lib/db/schema";
import { InsufficientCreditsError } from "@/lib/errors";
import { formatCents } from "@/lib/format";
import {
  creditPackForCents,
  promotionForCents,
  type PaidPlanId,
} from "@/lib/plans";
import {
  customerIdOf,
  getStripe,
  paymentIntentIdOf,
  subscriptionIdOf,
  subscriptionPeriodEnd,
} from "@/lib/stripe";
import type { CompanyRecord, SubscriptionTier } from "@/lib/types";

export type LedgerRow = typeof adCreditLedger.$inferSelect;

function paidTierFromMetadata(value: string | undefined | null): PaidPlanId | null {
  if (value === "pro" || value === "pro_plus") {
    return value;
  }
  return null;
}

function isActiveSubscriptionStatus(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing" || status === "past_due";
}

async function claimStripeEvent(id: string, type: string): Promise<boolean> {
  const db = requireDb();
  const [row] = await db
    .insert(stripeEvents)
    .values({ id, type })
    .onConflictDoNothing()
    .returning({ id: stripeEvents.id });
  return Boolean(row);
}

async function releaseStripeEvent(id: string) {
  const db = requireDb();
  await db.delete(stripeEvents).where(eq(stripeEvents.id, id));
}

export async function getCompanyByStripeCustomerId(
  customerId: string,
): Promise<typeof companies.$inferSelect | null> {
  const db = requireDb();
  const [row] = await db
    .select()
    .from(companies)
    .where(eq(companies.stripeCustomerId, customerId))
    .limit(1);
  return row ?? null;
}

export async function getCompanyByStripeSubscriptionId(
  subscriptionId: string,
): Promise<typeof companies.$inferSelect | null> {
  const db = requireDb();
  const [row] = await db
    .select()
    .from(companies)
    .where(eq(companies.stripeSubscriptionId, subscriptionId))
    .limit(1);
  return row ?? null;
}

export async function listAdCreditLedger(
  companyId: string,
  limit = 20,
): Promise<LedgerRow[]> {
  const db = requireDb();
  return db
    .select()
    .from(adCreditLedger)
    .where(eq(adCreditLedger.companyId, companyId))
    .orderBy(desc(adCreditLedger.createdAt))
    .limit(limit);
}

export async function ensureStripeCustomer(options: {
  company: CompanyRecord;
  email?: string | null;
  name?: string | null;
}): Promise<string> {
  if (options.company.stripeCustomerId) {
    return options.company.stripeCustomerId;
  }
  const stripe = getStripe();
  const customer = await stripe.customers.create({
    name: options.name ?? options.company.name,
    email: options.email ?? undefined,
    metadata: { companyId: options.company.id },
  });
  const db = requireDb();
  await db
    .update(companies)
    .set({
      stripeCustomerId: customer.id,
      updatedAt: new Date(),
    })
    .where(eq(companies.id, options.company.id));
  return customer.id;
}

export async function addPurchasedCredits(options: {
  companyId: string;
  cents: number;
  paymentIntentId: string;
  claimId: string;
  claimType: string;
}): Promise<"applied" | "already"> {
  const claimed = await claimStripeEvent(options.claimId, options.claimType);
  if (!claimed) {
    return "already";
  }
  const db = requireDb();
  try {
    const [ledger] = await db
      .insert(adCreditLedger)
      .values({
        companyId: options.companyId,
        deltaCents: options.cents,
        reason: "purchase",
        stripePaymentIntentId: options.paymentIntentId,
      })
      .onConflictDoNothing({ target: adCreditLedger.stripePaymentIntentId })
      .returning({ id: adCreditLedger.id });
    if (!ledger) {
      return "already";
    }
    await db
      .update(companies)
      .set({
        adCreditBalanceCents: sql`${companies.adCreditBalanceCents} + ${options.cents}`,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, options.companyId));
    return "applied";
  } catch (error) {
    await releaseStripeEvent(options.claimId);
    throw error;
  }
}

export async function applySubscriptionSnapshot(options: {
  companyId: string;
  customerId: string | null;
  subscription: Stripe.Subscription;
  claimId: string;
  claimType: string;
}): Promise<"applied" | "already"> {
  const claimed = await claimStripeEvent(options.claimId, options.claimType);
  if (!claimed) {
    return "already";
  }
  const db = requireDb();
  try {
    const metadataTier = paidTierFromMetadata(options.subscription.metadata?.tier);
    const status = options.subscription.status;
    const periodEnd = subscriptionPeriodEnd(options.subscription);
    const nextTier: SubscriptionTier | undefined = isActiveSubscriptionStatus(status)
      ? (metadataTier ?? undefined)
      : "free";
    await db
      .update(companies)
      .set({
        ...(options.customerId ? { stripeCustomerId: options.customerId } : {}),
        stripeSubscriptionId: options.subscription.id,
        subscriptionStatus: status,
        currentPeriodEnd: periodEnd,
        ...(nextTier ? { subscriptionTier: nextTier } : {}),
        updatedAt: new Date(),
      })
      .where(eq(companies.id, options.companyId));
    return "applied";
  } catch (error) {
    await releaseStripeEvent(options.claimId);
    throw error;
  }
}

async function resolveCompanyIdFromSubscription(
  subscription: Stripe.Subscription,
): Promise<string | null> {
  const fromMeta = subscription.metadata?.companyId;
  if (fromMeta) {
    return fromMeta;
  }
  const bySub = await getCompanyByStripeSubscriptionId(subscription.id);
  if (bySub) {
    return bySub.id;
  }
  const customerId = customerIdOf(subscription.customer);
  if (!customerId) {
    return null;
  }
  const byCustomer = await getCompanyByStripeCustomerId(customerId);
  return byCustomer?.id ?? null;
}

export async function syncSubscriptionFromStripe(
  subscription: Stripe.Subscription,
  claimId: string,
  claimType: string,
): Promise<"applied" | "already" | "ignored"> {
  const companyId = await resolveCompanyIdFromSubscription(subscription);
  if (!companyId) {
    return "ignored";
  }
  return applySubscriptionSnapshot({
    companyId,
    customerId: customerIdOf(subscription.customer),
    subscription,
    claimId,
    claimType,
  });
}

export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<"applied" | "already" | "ignored"> {
  if (session.status !== "complete" && session.payment_status !== "paid") {
    return "ignored";
  }
  const companyId = session.metadata?.companyId;
  if (!companyId) {
    return "ignored";
  }

  const claimId = `checkout:${session.id}`;
  const kind = session.metadata?.kind ?? (session.mode === "subscription" ? "subscription" : "credits");

  if (kind === "credits" || session.mode === "payment") {
    const packCents = Number(session.metadata?.packCents ?? session.amount_total ?? 0);
    if (!creditPackForCents(packCents)) {
      return "ignored";
    }
    const paymentIntentId =
      paymentIntentIdOf(session.payment_intent) ?? session.id;
    return addPurchasedCredits({
      companyId,
      cents: packCents,
      paymentIntentId,
      claimId,
      claimType: "checkout.session.completed",
    });
  }

  const stripe = getStripe();
  const subscriptionId = subscriptionIdOf(session.subscription);
  if (!subscriptionId) {
    return "ignored";
  }
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const metadataTier =
    paidTierFromMetadata(session.metadata?.tier) ??
    paidTierFromMetadata(subscription.metadata?.tier);
  if (metadataTier && !subscription.metadata?.tier) {
    await stripe.subscriptions.update(subscriptionId, {
      metadata: {
        ...subscription.metadata,
        companyId,
        tier: metadataTier,
      },
    });
    subscription.metadata = {
      ...subscription.metadata,
      companyId,
      tier: metadataTier,
    };
  }
  return applySubscriptionSnapshot({
    companyId,
    customerId: customerIdOf(session.customer),
    subscription,
    claimId,
    claimType: "checkout.session.completed",
  });
}

export async function fulfillCheckoutSessionId(
  sessionId: string,
  expectedCompanyId?: string,
): Promise<"applied" | "already" | "ignored"> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription", "payment_intent"],
  });
  if (expectedCompanyId && session.metadata?.companyId !== expectedCompanyId) {
    throw new Error("That checkout does not belong to this company.");
  }
  return fulfillCheckoutSession(session);
}

export async function handleStripeEvent(event: Stripe.Event): Promise<"applied" | "already" | "ignored"> {
  switch (event.type) {
    case "checkout.session.completed": {
      return fulfillCheckoutSession(event.data.object);
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      return syncSubscriptionFromStripe(
        event.data.object,
        `evt:${event.id}`,
        event.type,
      );
    }
    case "invoice.paid": {
      const invoice = event.data.object;
      const subscriptionId =
        typeof invoice.parent?.subscription_details?.subscription === "string"
          ? invoice.parent.subscription_details.subscription
          : invoice.parent?.subscription_details?.subscription?.id ?? null;
      if (!subscriptionId) {
        return "ignored";
      }
      const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
      return syncSubscriptionFromStripe(subscription, `evt:${event.id}`, event.type);
    }
    default:
      return "ignored";
  }
}

export async function spendCreditsToPromote(options: {
  companyId: string;
  jobId: string;
  packCents: number;
}): Promise<{ balance: number; promotedUntil: Date }> {
  const pack = promotionForCents(options.packCents);
  if (!pack) {
    throw new Error("Choose a 7-day, 21-day, or 70-day promotion.");
  }
  const db = requireDb();
  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, options.jobId), eq(jobs.companyId, options.companyId)))
    .limit(1);
  if (!job) {
    throw new Error("Job not found.");
  }
  if (job.status !== "published") {
    throw new Error("Publish the job before promoting it.");
  }

  const [company] = await db
    .select({ balance: companies.adCreditBalanceCents })
    .from(companies)
    .where(eq(companies.id, options.companyId))
    .limit(1);
  if (!company || company.balance < pack.cents) {
    throw new InsufficientCreditsError(
      `You have ${formatCents(company?.balance ?? 0)} in ad credits. Buy a ${pack.label.replace(" days", "-day")} pack on Billing to promote this job.`,
    );
  }

  const result = await db.execute(sql`
    WITH spent AS (
      UPDATE companies
      SET
        ad_credit_balance_cents = ad_credit_balance_cents - ${pack.cents},
        updated_at = now()
      WHERE id = ${options.companyId}::uuid
        AND ad_credit_balance_cents >= ${pack.cents}
      RETURNING ad_credit_balance_cents
    ),
    job_updated AS (
      UPDATE jobs
      SET
        promotion_tier = 'credits',
        promoted_until = GREATEST(COALESCE(promoted_until, now()), now())
          + (${pack.days} * interval '1 day'),
        promotion_spend_cents = promotion_spend_cents + ${pack.cents},
        updated_at = now()
      WHERE id = ${options.jobId}::uuid
        AND company_id = ${options.companyId}::uuid
        AND EXISTS (SELECT 1 FROM spent)
      RETURNING promoted_until
    ),
    ledger AS (
      INSERT INTO ad_credit_ledger (company_id, delta_cents, reason, job_id)
      SELECT ${options.companyId}::uuid, ${-pack.cents}, 'spend', ${options.jobId}::uuid
      FROM spent
      RETURNING id
    )
    SELECT
      spent.ad_credit_balance_cents AS balance,
      job_updated.promoted_until AS "promotedUntil"
    FROM spent
    INNER JOIN job_updated ON true
    INNER JOIN ledger ON true
  `);

  const rows = "rows" in result ? result.rows : result;
  const row = Array.isArray(rows) ? rows[0] : undefined;
  if (!row) {
    throw new InsufficientCreditsError(
      `You have ${formatCents(company.balance)} in ad credits. Buy a pack on Billing to promote this job.`,
    );
  }
  const promotedUntil = new Date(String(row.promotedUntil));
  return {
    balance: Number(row.balance),
    promotedUntil,
  };
}

export async function expirePromotions(now = new Date()): Promise<number> {
  const db = requireDb();
  const expired = await db
    .update(jobs)
    .set({
      promotionTier: "none",
      promotedUntil: null,
      updatedAt: now,
    })
    .where(and(isNotNull(jobs.promotedUntil), lt(jobs.promotedUntil, now)))
    .returning({ id: jobs.id });
  return expired.length;
}

export function isPartnerBilled(company: Pick<CompanyRecord, "overrideTier">): boolean {
  return Boolean(company.overrideTier);
}

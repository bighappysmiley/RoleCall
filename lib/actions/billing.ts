"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkoutCreditsSchema,
  checkoutPlanSchema,
  promoteJobSchema,
} from "@/lib/auth/schemas";
import type { ActionState } from "@/lib/auth/state";
import {
  ensureStripeCustomer,
  isPartnerBilled,
  spendCreditsToPromote,
} from "@/lib/billing";
import { requireCompanyAccess } from "@/lib/dashboard";
import { errorMessage } from "@/lib/errors";
import { formString } from "@/lib/form";
import { formatCents, formatShortDate } from "@/lib/format";
import { canManageBilling, canManageJobs } from "@/lib/permissions";
import {
  creditPackForCents,
  getPlan,
  promotionForCents,
  type PaidPlanId,
} from "@/lib/plans";
import { getJobById } from "@/lib/queries";
import {
  creditPackPriceData,
  getSiteUrl,
  getStripe,
  isStripeConfigured,
  subscriptionPriceData,
} from "@/lib/stripe";

function billingError(error: unknown, fallback: string): ActionState {
  return { error: errorMessage(error, fallback) };
}

async function requireBillingCompany(companyId: string) {
  const ctx = await requireCompanyAccess(companyId);
  if (!canManageBilling(ctx.access)) {
    throw new Error("Only an owner or admin can change billing.");
  }
  if (isPartnerBilled(ctx.company)) {
    throw new Error("This company is on a partner plan. Billing is handled separately.");
  }
  return ctx;
}

export async function startPlanCheckoutAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = checkoutPlanSchema.safeParse({
    companyId: formString(formData, "companyId"),
    tier: formString(formData, "tier"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Choose a plan." };
  }
  if (!isStripeConfigured()) {
    return {
      error:
        "Add STRIPE_SECRET_KEY in Netlify → Environment variables (Stripe test mode is free) to start checkout.",
    };
  }
  let url = "";
  try {
    const { company, user } = await requireBillingCompany(parsed.data.companyId);
    const tier = parsed.data.tier as PaidPlanId;
    const plan = getPlan(tier);
    const customerId = await ensureStripeCustomer({
      company,
      email: user.email,
      name: user.name ?? company.name,
    });
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      success_url: `${getSiteUrl()}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getSiteUrl()}/dashboard/billing?canceled=1`,
      metadata: {
        companyId: company.id,
        kind: "subscription",
        tier,
      },
      subscription_data: {
        metadata: {
          companyId: company.id,
          tier,
        },
      },
      line_items: [{ price_data: subscriptionPriceData(tier), quantity: 1 }],
    });
    if (!session.url) {
      throw new Error(`Could not start ${plan.name} checkout.`);
    }
    url = session.url;
  } catch (error) {
    return billingError(error, "Could not start checkout.");
  }
  redirect(url);
}

export async function startCreditCheckoutAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = checkoutCreditsSchema.safeParse({
    companyId: formString(formData, "companyId"),
    packCents: formString(formData, "packCents"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Choose a credit pack." };
  }
  const pack = creditPackForCents(parsed.data.packCents);
  if (!pack) {
    return { error: "Choose a $10, $25, or $100 credit pack." };
  }
  if (!isStripeConfigured()) {
    return {
      error:
        "Add STRIPE_SECRET_KEY in Netlify → Environment variables (Stripe test mode is free) to buy credits.",
    };
  }
  let url = "";
  try {
    const { company, user } = await requireBillingCompany(parsed.data.companyId);
    const customerId = await ensureStripeCustomer({
      company,
      email: user.email,
      name: user.name ?? company.name,
    });
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      success_url: `${getSiteUrl()}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getSiteUrl()}/dashboard/billing?canceled=1`,
      metadata: {
        companyId: company.id,
        kind: "credits",
        packCents: String(pack.cents),
      },
      line_items: [
        {
          price_data: creditPackPriceData(pack.cents, pack.label),
          quantity: 1,
        },
      ],
    });
    if (!session.url) {
      throw new Error("Could not start credit checkout.");
    }
    url = session.url;
  } catch (error) {
    return billingError(error, "Could not start checkout.");
  }
  redirect(url);
}

export async function startBillingPortalAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const companyId = formString(formData, "companyId");
  if (!isStripeConfigured()) {
    return {
      error:
        "Add STRIPE_SECRET_KEY in Netlify → Environment variables (Stripe test mode is free) to open the billing portal.",
    };
  }
  let url = "";
  try {
    const { company } = await requireBillingCompany(companyId);
    if (!company.stripeCustomerId) {
      return { error: "No Stripe customer yet. Start a plan or buy credits first." };
    }
    const session = await getStripe().billingPortal.sessions.create({
      customer: company.stripeCustomerId,
      return_url: `${getSiteUrl()}/dashboard/billing`,
    });
    url = session.url;
  } catch (error) {
    return billingError(
      error,
      "Could not open the billing portal. In Stripe test mode, turn on the Customer Portal under Settings.",
    );
  }
  redirect(url);
}

export async function promoteJobAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = promoteJobSchema.safeParse({
    jobId: formString(formData, "jobId"),
    packCents: formString(formData, "packCents"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Choose a promotion." };
  }
  const pack = promotionForCents(parsed.data.packCents);
  if (!pack) {
    return { error: "Choose a 7-day, 21-day, or 70-day promotion." };
  }
  try {
    const job = await getJobById(parsed.data.jobId);
    if (!job) {
      return { error: "Job not found." };
    }
    const { access } = await requireCompanyAccess(job.companyId);
    if (!canManageJobs(access)) {
      return { error: "You can view jobs, but you cannot promote them." };
    }
    const result = await spendCreditsToPromote({
      companyId: job.companyId,
      jobId: job.id,
      packCents: pack.cents,
    });
    revalidatePath(`/dashboard/jobs/${job.id}`);
    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard/billing");
    revalidatePath("/jobs");
    return {
      success: `Promoted for ${pack.label} (${formatCents(pack.cents)}). Visible until ${formatShortDate(result.promotedUntil)}. ${formatCents(result.balance)} left in credits.`,
    };
  } catch (error) {
    return billingError(error, "Could not promote this job.");
  }
}

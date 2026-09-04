import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BillingPortalForm,
  CreditCheckoutForm,
  PlanCheckoutForm,
} from "@/components/billing-forms";
import { Button } from "@/components/ui/button";
import { fulfillCheckoutSessionId, isPartnerBilled, listAdCreditLedger } from "@/lib/billing";
import { requireEmployerCompany } from "@/lib/dashboard";
import { formatCents, formatShortDate } from "@/lib/format";
import { canManageBilling } from "@/lib/permissions";
import { companyPlan, getPlan } from "@/lib/plans";
import { isStripeConfigured } from "@/lib/stripe";

export const metadata: Metadata = { title: "Billing" };
export const dynamic = "force-dynamic";

type Search = {
  session_id?: string | string[];
  paid?: string | string[];
  canceled?: string | string[];
  error?: string | string[];
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { company, access } = await requireEmployerCompany();
  if (!company || !access) {
    redirect("/dashboard/company");
  }

  const params = await searchParams;
  const sessionId = first(params.session_id);
  if (sessionId && isStripeConfigured()) {
    try {
      await fulfillCheckoutSessionId(sessionId, company.id);
    } catch (error) {
      console.error("Checkout fulfillment failed.", error);
      redirect("/dashboard/billing?error=1");
    }
    redirect("/dashboard/billing?paid=1");
  }

  const plan = companyPlan(company.subscriptionTier, company.overrideTier);
  const canBill = canManageBilling(access);
  const partner = isPartnerBilled(company);
  const stripeReady = isStripeConfigured();
  const paid = first(params.paid) === "1";
  const canceled = first(params.canceled) === "1";
  const errored = first(params.error) === "1";
  const ledger = partner ? [] : await listAdCreditLedger(company.id);
  const pro = getPlan("pro");
  const proPlus = getPlan("pro_plus");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
        BILLING
      </p>
      <h1 className="mt-2 font-heading text-4xl">Plan and credits</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Limits are enforced on the server. Stripe test mode is free and does not
        charge a real card.
      </p>

      {paid ? (
        <p className="mt-4 border border-line bg-fog px-4 py-3 text-sm">
          Payment recorded. Your plan or credit balance should match what you just bought.
        </p>
      ) : null}
      {canceled ? (
        <p className="mt-4 border border-line bg-fog px-4 py-3 text-sm text-muted-foreground">
          Checkout was canceled. Nothing was charged.
        </p>
      ) : null}
      {errored ? (
        <p className="mt-4 text-sm text-destructive">
          Checkout came back, but we could not apply it to this company. Try again or check the Stripe dashboard.
        </p>
      ) : null}

      {partner ? (
        <section className="mt-8 border border-line p-5">
          <h2 className="font-heading text-2xl">Partner plan</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {company.name} is on {plan.name} through a partner override. There is
            no self-serve checkout or Stripe portal for this account.
          </p>
          <p className="mt-4 font-mono text-[11px] tracking-wider text-muted-foreground">
            EFFECTIVE TIER · {plan.name.toUpperCase()}
          </p>
        </section>
      ) : (
        <>
          {!stripeReady ? (
            <p className="mt-6 border border-line bg-fog px-4 py-3 font-mono text-[11px] tracking-wide text-muted-foreground">
              Add <span className="text-ink">STRIPE_SECRET_KEY</span> in{" "}
              <span className="text-ink">Netlify → Environment variables</span>{" "}
              to turn on checkout. Use Stripe test mode (free). Optional:{" "}
              <span className="text-ink">STRIPE_WEBHOOK_SECRET</span> for live
              webhook updates.
            </p>
          ) : null}

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <section className="border border-line p-4">
              <h2 className="font-mono text-[11px] tracking-wider text-muted-foreground">
                CURRENT PLAN
              </h2>
              <p className="mt-2 font-heading text-2xl">{plan.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {company.subscriptionStatus
                  ? company.subscriptionStatus.replaceAll("_", " ")
                  : "No Stripe subscription yet"}
                {company.currentPeriodEnd
                  ? ` · renews ${formatShortDate(company.currentPeriodEnd)}`
                  : ""}
              </p>
            </section>
            <section className="border border-line p-4">
              <h2 className="font-mono text-[11px] tracking-wider text-muted-foreground">
                AD CREDITS
              </h2>
              <p className="mt-2 font-heading text-2xl">
                {formatCents(company.adCreditBalanceCents)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Spend on a published job: 7 days / $10, 21 days / $25, 70 days / $100.
              </p>
            </section>
            <section className="border border-line p-4">
              <h2 className="font-mono text-[11px] tracking-wider text-muted-foreground">
                ACCESS
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {canBill
                  ? "Owners and admins can change the plan and buy credits. Recruiters can spend credits to promote a job."
                  : "Your seat cannot change billing. Ask an owner or admin."}
              </p>
            </section>
          </div>

          <section className="mt-8 grid gap-3 md:grid-cols-2">
            <article className="flex flex-col border border-line p-5">
              <p className="font-mono text-[11px] tracking-wider text-muted-foreground">
                {pro.name.toUpperCase()}
              </p>
              <p className="mt-2 font-heading text-3xl">
                {pro.priceLabel}
                <span className="text-base text-muted-foreground"> /mo</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{pro.blurb}</p>
              <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm">
                {pro.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {canBill ? (
                <div className="mt-6">
                  <PlanCheckoutForm
                    companyId={company.id}
                    plan={pro}
                    current={plan.id === "pro"}
                    included={plan.id === "pro_plus" || plan.id === "enterprise"}
                  />
                </div>
              ) : null}
            </article>
            <article className="flex flex-col border border-line p-5">
              <p className="font-mono text-[11px] tracking-wider text-muted-foreground">
                {proPlus.name.toUpperCase()}
              </p>
              <p className="mt-2 font-heading text-3xl">
                {proPlus.priceLabel}
                <span className="text-base text-muted-foreground"> /mo</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{proPlus.blurb}</p>
              <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm">
                {proPlus.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {canBill ? (
                <div className="mt-6">
                  <PlanCheckoutForm
                    companyId={company.id}
                    plan={proPlus}
                    current={plan.id === "pro_plus"}
                    included={plan.id === "enterprise"}
                  />
                </div>
              ) : null}
            </article>
          </section>

          <section className="mt-8 border border-line p-5">
            <h2 className="font-heading text-2xl">Ad credit packs</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Any plan can buy credits. They are not a subscription. After purchase,
              open a published job and choose a duration.
            </p>
            {canBill ? (
              <div className="mt-4">
                <CreditCheckoutForm companyId={company.id} />
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Ask an owner or admin to buy credits.
              </p>
            )}
          </section>

          {canBill && company.stripeCustomerId ? (
            <section className="mt-8 border border-line p-5">
              <h2 className="font-heading text-2xl">Customer portal</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Update the card or cancel the subscription in Stripe. Canceled plans
                return to Free at period end once Stripe sends the update.
              </p>
              <div className="mt-4">
                <BillingPortalForm companyId={company.id} />
              </div>
            </section>
          ) : null}

          {ledger.length > 0 ? (
            <section className="mt-8">
              <h2 className="font-heading text-2xl">Credit history</h2>
              <ul className="mt-3 divide-y divide-line border border-line">
                {ledger.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                  >
                    <span>
                      {row.reason}
                      <span className="text-muted-foreground">
                        {" "}
                        · {formatShortDate(row.createdAt)}
                      </span>
                    </span>
                    <span className="font-mono text-[12px]">
                      {row.deltaCents > 0 ? "+" : ""}
                      {formatCents(row.deltaCents)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}

      <p className="mt-8 text-sm text-muted-foreground">
        Public pricing lives on{" "}
        <Link href="/pricing" className="underline">
          /pricing
        </Link>
        . Promote a job from{" "}
        <Link href="/dashboard/jobs" className="underline">
          Jobs
        </Link>
        .
      </p>
      {!canBill && !partner ? (
        <Button className="mt-4" variant="outline" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      ) : null}
    </div>
  );
}

"use client";

import { useActionState } from "react";
import {
  startBillingPortalAction,
  startCreditCheckoutAction,
  startPlanCheckoutAction,
} from "@/lib/actions/billing";
import type { ActionState } from "@/lib/auth/state";
import { AD_CREDIT_PACKS, type PlanDefinition } from "@/lib/plans";
import { Button } from "@/components/ui/button";

function FormError({ state }: { state: ActionState }) {
  if (!state || !("error" in state)) {
    return null;
  }
  return <p className="text-sm text-destructive">{state.error}</p>;
}

export function PlanCheckoutForm({
  companyId,
  plan,
  current,
  included,
}: {
  companyId: string;
  plan: PlanDefinition;
  current: boolean;
  included?: boolean;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    startPlanCheckoutAction,
    null,
  );
  const disabled = pending || current || included;
  const label = pending
    ? "Redirecting…"
    : current
      ? `On ${plan.name}`
      : included
        ? "On a higher plan"
        : `Upgrade to ${plan.name}`;
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="tier" value={plan.id} />
      <Button type="submit" disabled={disabled} variant={current ? "outline" : "default"}>
        {label}
      </Button>
      <FormError state={state} />
    </form>
  );
}

export function CreditCheckoutForm({
  companyId,
}: {
  companyId: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    startCreditCheckoutAction,
    null,
  );
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="companyId" value={companyId} />
      <div className="flex flex-wrap gap-2">
        {AD_CREDIT_PACKS.map((pack) => (
          <Button
            key={pack.cents}
            type="submit"
            name="packCents"
            value={String(pack.cents)}
            variant="outline"
            disabled={pending}
          >
            {pending ? "Redirecting…" : `Buy ${pack.label}`}
          </Button>
        ))}
      </div>
      <FormError state={state} />
    </form>
  );
}

export function BillingPortalForm({ companyId }: { companyId: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    startBillingPortalAction,
    null,
  );
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="companyId" value={companyId} />
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Opening…" : "Manage billing in Stripe"}
      </Button>
      <FormError state={state} />
    </form>
  );
}

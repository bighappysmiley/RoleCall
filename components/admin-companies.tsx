"use client";

import { useActionState } from "react";
import { setCompanyTierAction } from "@/lib/actions/admin";
import type { ActionState } from "@/lib/auth/state";
import { PLANS, companyPlan, effectiveTier } from "@/lib/plans";
import type { CompanyRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { RefreshOnSuccess } from "@/components/refresh-on-success";

function Status({ state }: { state: ActionState }) {
  if (!state) {
    return null;
  }
  if ("error" in state) {
    return <p className="text-sm text-destructive">{state.error}</p>;
  }
  return <p className="text-sm text-ink">{state.success}</p>;
}

export function AdminCompanyPlans({ companies }: { companies: CompanyRecord[] }) {
  if (companies.length === 0) {
    return (
      <p className="border border-line px-4 py-6 text-sm text-muted-foreground">
        No companies yet. When a hiring team creates a company, you can grant
        them a complimentary plan here.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {companies.map((company) => (
        <AdminCompanyPlanRow key={company.id} company={company} />
      ))}
    </ul>
  );
}

function AdminCompanyPlanRow({ company }: { company: CompanyRecord }) {
  const [state, action, pending] = useActionState(setCompanyTierAction, null);
  const effective = effectiveTier(
    company.subscriptionTier,
    company.overrideTier,
  );
  const plan = companyPlan(company.subscriptionTier, company.overrideTier);

  return (
    <li className="border border-line bg-white/90 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-heading text-lg tracking-[-0.03em]">{company.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Billed: {company.subscriptionTier.replaceAll("_", " ")}
            {" · "}
            Effective: {plan.name}
            {company.overrideTier ? " (complimentary)" : ""}
          </p>
        </div>
      </div>
      <form action={action} className="mt-4 flex flex-wrap items-end gap-3">
        <RefreshOnSuccess state={state} />
        <input type="hidden" name="companyId" value={company.id} />
        <label className="grid min-w-[12rem] flex-1 gap-1.5 text-sm">
          <span className="text-muted-foreground">Complimentary plan</span>
          <select
            name="overrideTier"
            defaultValue={company.overrideTier ?? "__none__"}
            className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="__none__">Use billed plan</option>
            {PLANS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
                {item.id === effective && company.overrideTier
                  ? " (current)"
                  : ""}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save plan"}
        </Button>
      </form>
      <Status state={state} />
    </li>
  );
}

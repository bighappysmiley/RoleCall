"use client";

import { useActionState } from "react";
import { promoteJobAction } from "@/lib/actions/billing";
import type { ActionState } from "@/lib/auth/state";
import { formatCents, formatShortDate } from "@/lib/format";
import { PROMOTION_PACKS } from "@/lib/plans";
import { RefreshOnSuccess } from "@/components/refresh-on-success";
import { Button } from "@/components/ui/button";

export function PromoteJobForm({
  jobId,
  balanceCents,
  promotedUntil,
  published,
  active,
}: {
  jobId: string;
  balanceCents: number;
  promotedUntil: Date | null;
  published: boolean;
  active: boolean;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    promoteJobAction,
    null,
  );

  return (
    <form action={action} className="mt-10 max-w-2xl border border-line p-4">
      <RefreshOnSuccess state={state} />
      <input type="hidden" name="jobId" value={jobId} />
      <p className="font-mono text-[11px] tracking-wider text-muted-foreground">
        PROMOTE
      </p>
      <h2 className="mt-1 font-heading text-2xl">Lift this listing</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Promoted jobs sit under Featured and above the rest of the board, with a
        labeled rail. Spend is taken from ad credits. Balance: {formatCents(balanceCents)}.
        {active ? ` Currently promoted until ${formatShortDate(promotedUntil)}.` : ""}
      </p>
      {!published ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Publish the job before promoting it. Drafts stay private.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {PROMOTION_PACKS.map((pack) => (
            <Button
              key={pack.cents}
              type="submit"
              name="packCents"
              value={String(pack.cents)}
              variant="outline"
              disabled={pending}
            >
              {pending ? "Promoting…" : `${pack.label} · ${formatCents(pack.cents)}`}
            </Button>
          ))}
        </div>
      )}
      {state && "error" in state ? (
        <p className="mt-3 text-sm text-destructive">{state.error}</p>
      ) : null}
      {state && "success" in state ? (
        <p className="mt-3 text-sm text-ink">{state.success}</p>
      ) : null}
    </form>
  );
}

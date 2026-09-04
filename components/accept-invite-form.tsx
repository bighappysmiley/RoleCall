"use client";

import { useActionState } from "react";
import { acceptInviteAction } from "@/lib/actions/team";
import { Button } from "@/components/ui/button";

export function AcceptInviteForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(acceptInviteAction, null);

  return (
    <form action={formAction} className="mt-6">
      <input type="hidden" name="token" value={token} />
      {state && "error" in state ? (
        <p className="mb-3 text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Joining…" : "Join this company"}
      </Button>
    </form>
  );
}
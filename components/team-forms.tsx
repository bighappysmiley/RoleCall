"use client";

import { useActionState } from "react";
import { inviteMemberAction, removeMemberAction } from "@/lib/actions/team";
import type { ActionState } from "@/lib/auth/state";
import { CopyLink } from "@/components/copy-link";
import { RefreshOnSuccess } from "@/components/refresh-on-success";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InviteForm({
  companyId,
  canInvite,
}: {
  companyId: string;
  canInvite: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    inviteMemberAction,
    null,
  );

  if (!canInvite) {
    return (
      <p className="text-sm text-muted-foreground">
        Your seat is view-only. Ask an admin to invite people.
      </p>
    );
  }

  return (
    <form action={formAction} className="grid max-w-xl gap-3 sm:grid-cols-[1fr_9rem_auto]">
      <RefreshOnSuccess state={state} />
      <input type="hidden" name="companyId" value={companyId} />
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          name="role"
          defaultValue="recruiter"
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="viewer">Viewer</option>
          <option value="recruiter">Recruiter</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Invite"}
        </Button>
      </div>
      {state && "error" in state ? (
        <p className="text-sm text-destructive sm:col-span-3">{state.error}</p>
      ) : null}
      {state && "success" in state ? (
        <div className="grid gap-2 sm:col-span-3">
          <p className="text-sm text-ink">{state.success}</p>
          {state.inviteUrl ? <CopyLink value={state.inviteUrl} /> : null}
        </div>
      ) : null}
    </form>
  );
}

export function RemoveMemberButton({
  companyId,
  memberId,
}: {
  companyId: string;
  memberId: string;
}) {
  const [state, formAction, pending] = useActionState(
    removeMemberAction,
    null,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="memberId" value={memberId} />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Removing…" : "Remove"}
      </Button>
      {state && "error" in state ? (
        <p className="mt-1 text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
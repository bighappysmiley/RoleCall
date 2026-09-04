"use client";

import { useActionState } from "react";
import { deleteCompanyAction } from "@/lib/actions/companies";
import { deleteJobAction } from "@/lib/actions/jobs";
import type { ActionState } from "@/lib/auth/state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DeleteCompanyForm({
  companyId,
  companyName,
}: {
  companyId: string;
  companyName: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    deleteCompanyAction,
    null,
  );

  return (
    <form action={formAction} className="mt-16 max-w-md border border-line p-4">
      <input type="hidden" name="companyId" value={companyId} />
      <h2 className="font-heading text-xl">Delete company</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This removes jobs, applications, and seats. Type {companyName} to confirm.
      </p>
      <div className="mt-3 grid gap-1.5">
        <Label htmlFor="confirm">Company name</Label>
        <Input id="confirm" name="confirm" />
      </div>
      {state && "error" in state ? (
        <p className="mt-2 text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" variant="destructive" className="mt-4" disabled={pending}>
        {pending ? "Deleting…" : "Delete company"}
      </Button>
    </form>
  );
}

export function DeleteJobForm({ jobId }: { jobId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    deleteJobAction,
    null,
  );

  return (
    <form action={formAction} className="mt-12">
      <input type="hidden" name="jobId" value={jobId} />
      {state && "error" in state ? (
        <p className="mb-2 text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" variant="destructive" disabled={pending}>
        {pending ? "Deleting…" : "Delete job"}
      </Button>
    </form>
  );
}
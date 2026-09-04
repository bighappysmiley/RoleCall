"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyToJobAction, toggleSaveJobAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ApplyForm({
  jobId,
  alreadyApplied,
}: {
  jobId: string;
  alreadyApplied: boolean;
}) {
  const [state, formAction, pending] = useActionState(applyToJobAction, null);

  if (alreadyApplied || (state && "success" in state)) {
    return (
            <p className="border border-line bg-fog px-4 py-3 text-sm">
        Application on file. Watch status from your dashboard.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="jobId" value={jobId} />
      <div className="grid gap-1.5">
        <Label htmlFor="coverLetter">Cover note</Label>
        <Textarea
          id="coverLetter"
          name="coverLetter"
          rows={6}
          placeholder="A short note is enough."
        />
      </div>
      {state && "error" in state ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Apply"}
      </Button>
    </form>
  );
}

export function SaveJobButton({ jobId, saved }: { jobId: string; saved: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await toggleSaveJobAction(jobId);
          router.refresh();
        });
      }}
    >
      {saved ? "Saved" : "Save"}
    </Button>
  );
}

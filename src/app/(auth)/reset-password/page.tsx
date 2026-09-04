"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestPasswordResetAction,
  type AuthFormState,
} from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    requestPasswordResetAction,
    null
  );

  const sent = state !== null && !state?.error;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl font-medium tracking-tight">
        Reset password
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        We&apos;ll email a reset link if that address has an account.
      </p>

      {sent ? (
        <p className="mt-6 border border-[var(--line)] bg-[var(--fog)] p-4 text-sm">
          Check your inbox for the next step.
        </p>
      ) : (
        <form action={action} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          {state?.error ? (
            <p className="text-sm text-[var(--danger)]">{state.error}</p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-sm">
        <Link href="/login" className="text-[var(--primary)] hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}

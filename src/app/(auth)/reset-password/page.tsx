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
    <div className="hero-glow flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="surface-card w-full max-w-md p-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Reset password
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Enter your email and we’ll send a link to choose a new password.
        </p>

        {sent ? (
          <p className="mt-8 rounded-[6px] bg-[var(--primary-soft)] px-4 py-3 text-sm text-[var(--ink)]">
            If an account exists for that email, you’ll receive a reset link
            shortly.
          </p>
        ) : (
          <form action={action} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
            </div>
            {state?.error ? (
              <p className="text-sm text-[var(--danger)]">{state.error}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          <Link
            href="/login"
            className="font-semibold text-[var(--primary)] hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

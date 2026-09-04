"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState, useState } from "react";
import { signUpAction, type AuthFormState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SignUpForm() {
  const params = useSearchParams();
  const defaultType =
    params.get("intent") === "employer" ? "employer" : "candidate";
  const [accountType, setAccountType] = useState<"candidate" | "employer">(
    defaultType
  );
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    signUpAction,
    null
  );

  return (
    <div className="hero-glow flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="surface-card w-full max-w-md p-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Join RoleCall
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Create a free account to apply for roles or hire talent.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`rounded-[6px] border px-3 py-2.5 text-sm font-medium transition-colors ${
              accountType === "candidate"
                ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--ink)]"
                : "border-[var(--line)] bg-[var(--paper)] text-[var(--muted)]"
            }`}
            onClick={() => setAccountType("candidate")}
          >
            Find a job
          </button>
          <button
            type="button"
            className={`rounded-[6px] border px-3 py-2.5 text-sm font-medium transition-colors ${
              accountType === "employer"
                ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--ink)]"
                : "border-[var(--line)] bg-[var(--paper)] text-[var(--muted)]"
            }`}
            onClick={() => setAccountType("employer")}
          >
            Hire talent
          </button>
        </div>

        <form action={action} className="mt-6 space-y-4">
          <input type="hidden" name="accountType" value={accountType} />
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required autoComplete="name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
            />
            <p className="text-xs text-[var(--muted)]">At least 8 characters.</p>
          </div>
          {state?.error ? (
            <p className="text-sm text-[var(--danger)]">{state.error}</p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[var(--primary)] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-sm text-[var(--muted)]">
          Loading…
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}

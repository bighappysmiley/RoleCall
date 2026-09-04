"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, type AuthFormState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    signInAction,
    null
  );

  return (
    <div className="hero-glow flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="surface-card w-full max-w-md p-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Sign in to continue to RoleCall.
        </p>

        <form action={action} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/reset-password"
                className="text-sm font-medium text-[var(--primary)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          {state?.error ? (
            <p className="text-sm text-[var(--danger)]">{state.error}</p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          New here?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[var(--primary)] hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

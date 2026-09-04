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
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl font-medium tracking-tight">
        Log in
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Welcome back to RoleCall.
      </p>

      <form action={action} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        {state?.error ? (
          <p className="text-sm text-[var(--danger)]">{state.error}</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-4 text-sm">
        <Link href="/reset-password" className="text-[var(--primary)] hover:underline">
          Reset password
        </Link>
      </p>
      <p className="mt-6 text-sm text-[var(--muted)]">
        New here?{" "}
        <Link href="/signup" className="text-[var(--primary)] hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

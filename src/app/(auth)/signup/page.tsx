"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signUpAction, type AuthFormState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const [accountType, setAccountType] = useState<"candidate" | "employer">(
    "candidate"
  );
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    signUpAction,
    null
  );

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl font-medium tracking-tight">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Choose how you&apos;ll use RoleCall.
      </p>

      <div className="mt-6 grid grid-cols-2 border border-[var(--line)]">
        <button
          type="button"
          className={`px-3 py-2 text-sm ${accountType === "candidate" ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--paper)]"}`}
          onClick={() => setAccountType("candidate")}
        >
          Candidate
        </button>
        <button
          type="button"
          className={`px-3 py-2 text-sm ${accountType === "employer" ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--paper)]"}`}
          onClick={() => setAccountType("employer")}
        >
          Employer
        </button>
      </div>

      <form action={action} className="mt-6 space-y-4">
        <input type="hidden" name="accountType" value={accountType} />
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" minLength={8} required />
        </div>
        {state?.error ? (
          <p className="text-sm text-[var(--danger)]">{state.error}</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--primary)] hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

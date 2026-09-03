"use client";

import { useActionState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import type { ActionState } from "@/lib/auth/state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GoogleButton({ callbackURL = "/dashboard" }: { callbackURL?: string }) {
  async function onClick() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });
  }

  return (
    <Button type="button" variant="outline" className="w-full" onClick={onClick}>
      Continue with Google
    </Button>
  );
}

export function AuthForm({
  action,
  submitLabel,
  pendingLabel,
  includeName = false,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  pendingLabel: string;
  includeName?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {includeName ? (
        <div className="grid gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
      ) : null}
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={includeName ? "new-password" : "current-password"}
        />
      </div>
      {state && "error" in state ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state && "success" in state ? (
        <p className="text-sm text-ink">{state.success}</p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}

export function ForgotLink() {
  return (
    <Link
      href="/reset-password"
      className="text-center text-sm text-primary hover:underline"
    >
      Forgot password
    </Link>
  );
}

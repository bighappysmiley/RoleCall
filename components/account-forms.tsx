"use client";

import { useActionState } from "react";
import {
  completeOnboardingAction,
  requestPasswordResetAction,
  updatePasswordAction,
  updateProfileAction,
} from "@/lib/auth/actions";
import type { ProfileRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(
    completeOnboardingAction,
    null,
  );

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <button
        type="submit"
        name="accountType"
        value="candidate"
        disabled={pending}
        className="border border-line bg-paper px-4 py-6 text-left hover:bg-fog"
      >
        <span className="font-heading text-xl">I am looking</span>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse jobs, keep a profile, track applications.
        </p>
      </button>
      <button
        type="submit"
        name="accountType"
        value="employer"
        disabled={pending}
        className="border border-line bg-paper px-4 py-6 text-left hover:bg-fog"
      >
        <span className="font-heading text-xl">I am hiring</span>
        <p className="mt-2 text-sm text-muted-foreground">
          Company workspace, job posts, and the pipeline come next.
        </p>
      </button>
      {state && "error" in state ? (
        <p className="text-sm text-destructive sm:col-span-2">{state.error}</p>
      ) : null}
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      {state && "error" in state ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state && "success" in state ? (
        <p className="text-sm text-ink">{state.success}</p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}

export function UpdatePasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <div className="grid gap-1.5">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      {state && "error" in state ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Update password"}
      </Button>
    </form>
  );
}

export function ProfileForm({ profile }: { profile: ProfileRecord }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, null);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="fullName">Name</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={profile.fullName ?? ""}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          name="headline"
          defaultValue={profile.headline ?? ""}
          placeholder="Product engineer, dispatcher, designer…"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          defaultValue={profile.location ?? ""}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" rows={5} defaultValue={profile.bio ?? ""} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          name="website"
          type="url"
          defaultValue={profile.links.website ?? ""}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="linkedin">LinkedIn</Label>
        <Input
          id="linkedin"
          name="linkedin"
          type="url"
          defaultValue={profile.links.linkedin ?? ""}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="github">GitHub</Label>
        <Input
          id="github"
          name="github"
          type="url"
          defaultValue={profile.links.github ?? ""}
        />
      </div>
      <p className="font-mono text-[11px] tracking-wide text-muted-foreground">
        Resume upload comes later. No files in this build.
      </p>
      {state && "error" in state ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state && "success" in state ? (
        <p className="text-sm text-ink">{state.success}</p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

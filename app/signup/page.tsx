import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm, GoogleButton } from "@/components/auth-form";
import { signUpAction } from "@/lib/auth/actions";
import { isAuthConfigured } from "@/lib/auth/server";
import { safeNextPath } from "@/lib/form";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const configured = isAuthConfigured();
  const next = safeNextPath((await searchParams).next);

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="font-heading text-3xl">Create account</h1>
      <p className="mt-2 mb-6 text-sm text-muted-foreground">
        {configured
          ? "Then choose whether you are hiring or looking."
          : "Add Neon Auth keys in Netlify → Environment variables to turn this on."}
      </p>
      <div className="flex flex-col gap-4">
        <GoogleButton callbackURL={next ? `/onboarding?next=${encodeURIComponent(next)}` : "/onboarding"} />
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-wider text-muted-foreground">
          <span className="h-px flex-1 bg-line" />
          OR
          <span className="h-px flex-1 bg-line" />
        </div>
        <AuthForm
          action={signUpAction}
          submitLabel="Create account"
          pendingLabel="Creating…"
          includeName
          next={next}
        />
        <p className="text-center text-sm text-muted-foreground">
          Already here?{" "}
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
            className="text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
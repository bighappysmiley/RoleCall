import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm, ForgotLink, GoogleButton } from "@/components/auth-form";
import { signInAction } from "@/lib/auth/actions";
import { isAuthConfigured } from "@/lib/auth/server";
import { safeNextPath } from "@/lib/form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const configured = isAuthConfigured();
  const next = safeNextPath((await searchParams).next);

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="font-display text-3xl tracking-[-0.04em]">Sign in</h1>
      <p className="mt-2 mb-6 text-sm text-muted-foreground">
        {configured
          ? "Use email and password, or continue with Google."
          : "Sign-in is temporarily unavailable. Please try again soon."}
      </p>
      <div className="flex flex-col gap-4">
        <GoogleButton callbackURL={next ?? "/dashboard"} />
        <div className="flex items-center gap-3 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>
        <AuthForm
          action={signInAction}
          submitLabel="Sign in"
          pendingLabel="Signing in…"
          next={next}
        />
        <ForgotLink />
        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link
            href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
            className="text-primary hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
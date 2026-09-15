import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm, ForgotLink, GoogleButton } from "@/components/auth-form";
import { Wordmark } from "@/components/wordmark";
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
    <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-4 py-12 sm:py-16 lg:flex-row lg:items-stretch lg:gap-12">
      <aside className="relative hidden min-h-[28rem] flex-1 overflow-hidden rounded-3xl bg-navy p-8 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -top-16 right-0 size-56 rounded-full bg-primary/35 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 size-48 rounded-full bg-signal/25 blur-3xl" />
        <div className="relative">
          <Wordmark className="text-white [&_span]:text-white" />
          <h1 className="mt-10 font-display text-4xl tracking-[-0.04em]">
            Welcome back.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            Pick up where you left off — browse roles, manage applications, or
            keep hiring with labeled placement.
          </p>
        </div>
        <p className="relative text-sm text-white/55">
          Clear hiring. Open placement.
        </p>
      </aside>
      <div className="surface w-full max-w-md flex-1 p-6 sm:p-8">
        <h1 className="font-display text-3xl tracking-[-0.04em] lg:hidden">
          Sign in
        </h1>
        <h2 className="hidden font-display text-3xl tracking-[-0.04em] lg:block">
          Sign in
        </h2>
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
    </div>
  );
}

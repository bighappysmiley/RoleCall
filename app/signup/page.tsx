import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm, GoogleButton } from "@/components/auth-form";
import { Wordmark } from "@/components/wordmark";
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
    <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-4 py-12 sm:py-16 lg:flex-row lg:items-stretch lg:gap-12">
      <aside className="relative hidden min-h-[28rem] flex-1 overflow-hidden rounded-3xl bg-navy p-8 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -top-10 left-1/3 size-52 rounded-full bg-primary/40 blur-3xl float-soft" />
        <div className="pointer-events-none absolute -bottom-8 right-0 size-44 rounded-full bg-signal/20 blur-3xl" />
        <div className="relative">
          <Wordmark className="text-white [&_span]:text-white" />
          <h1 className="mt-10 font-display text-4xl tracking-[-0.04em]">
            Join RoleCall.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            Create an account to apply for roles or start hiring with placement
            that stays clearly labeled.
          </p>
        </div>
        <p className="relative text-sm text-white/55">
          Free to start. Upgrade when you grow.
        </p>
      </aside>
      <div className="surface w-full max-w-md flex-1 p-6 sm:p-8">
        <h1 className="font-display text-3xl tracking-[-0.04em] lg:hidden">
          Create account
        </h1>
        <h2 className="hidden font-display text-3xl tracking-[-0.04em] lg:block">
          Create account
        </h2>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">
          {configured
            ? "Then choose whether you are hiring or looking for work."
            : "Account creation is temporarily unavailable. Please try again soon."}
        </p>
        <div className="flex flex-col gap-4">
          <GoogleButton
            callbackURL={
              next
                ? `/onboarding?next=${encodeURIComponent(next)}`
                : "/onboarding"
            }
          />
          <div className="flex items-center gap-3 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
            <span className="h-px flex-1 bg-line" />
            or
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
    </div>
  );
}

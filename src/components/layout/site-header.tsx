import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { signOutAction } from "@/actions/auth";

type Props = {
  userName?: string | null;
  accountType?: "candidate" | "employer" | null;
};

export function SiteHeader({ userName, accountType }: Props) {
  return (
    <header className="border-b border-[var(--line)] bg-[var(--paper)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Wordmark />
        <nav className="flex items-center gap-4 text-sm text-[var(--muted)]">
          <Link href="/jobs" className="hover:text-[var(--ink)]">
            Jobs
          </Link>
          <Link href="/companies" className="hover:text-[var(--ink)]">
            Companies
          </Link>
          <Link href="/pricing" className="hover:text-[var(--ink)]">
            Pricing
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          {userName ? (
            <>
              <span className="hidden text-[var(--muted)] sm:inline">
                {userName}
              </span>
              {accountType === "employer" ? (
                <Link
                  href="/dashboard"
                  className="text-[var(--primary)] hover:underline"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/profile"
                  className="text-[var(--primary)] hover:underline"
                >
                  Profile
                </Link>
              )}
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-[var(--ink)]">
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-[var(--primary)] px-3 py-1.5 text-white"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";
import { RoleCallMark } from "@/components/brand/wordmark";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--paper)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <RoleCallMark />
            <p className="font-display text-lg font-semibold text-[var(--ink)]">
              RoleCall
            </p>
          </div>
          <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
            The hiring marketplace for teams and talent.
          </p>
        </div>
        <div className="flex gap-10 text-sm text-[var(--muted)]">
          <div className="space-y-2">
            <p className="font-semibold text-[var(--ink)]">Explore</p>
            <Link href="/jobs" className="block hover:text-[var(--ink)]">
              Find work
            </Link>
            <Link href="/companies" className="block hover:text-[var(--ink)]">
              Companies
            </Link>
            <Link href="/pricing" className="block hover:text-[var(--ink)]">
              Pricing
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-[var(--ink)]">Account</p>
            <Link href="/signup" className="block hover:text-[var(--ink)]">
              Sign up
            </Link>
            <Link href="/login" className="block hover:text-[var(--ink)]">
              Log in
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--line)]">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-[var(--muted)]">
          © {new Date().getFullYear()} RoleCall
        </p>
      </div>
    </footer>
  );
}

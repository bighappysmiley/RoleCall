import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--paper)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 128 128" width="28" height="28" aria-hidden>
            <rect width="128" height="128" rx="14" fill="#1d4ed8" />
            <g fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 78 34 C 98 42 110 58 110 76 C 110 94 98 110 78 118" strokeWidth="8" />
              <path d="M 70 44 C 84 50 93 61 93 76 C 93 91 84 102 70 108" strokeWidth="8" />
              <path d="M 62 54 C 70 58 76 66 76 76 C 76 86 70 94 62 98" strokeWidth="8" />
            </g>
            <circle cx="42" cy="48" r="12" fill="#fff" />
            <path d="M 20 92 C 20 74 30 66 42 66 C 54 66 64 74 64 92 Z" fill="#fff" />
          </svg>
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

import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Wordmark />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            RoleCall helps people find work and companies hire with clear,
            labeled placement.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/jobs" className="transition-colors hover:text-ink">
            Jobs
          </Link>
          <Link href="/companies" className="transition-colors hover:text-ink">
            Companies
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-ink">
            Pricing
          </Link>
          <Link href="/signup" className="transition-colors hover:text-ink">
            Create account
          </Link>
        </div>
      </div>
    </footer>
  );
}

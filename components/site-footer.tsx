import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Wordmark />
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            A hiring board by BigHappySmiley. Paid placement is labeled. The
            rest of the list is ranked in the open.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] tracking-wide text-muted-foreground">
          <Link href="/jobs" className="hover:text-ink">
            JOBS
          </Link>
          <Link href="/companies" className="hover:text-ink">
            COMPANIES
          </Link>
          <Link href="/pricing" className="hover:text-ink">
            PRICING
          </Link>
          <span>FREE TIER · NEON · VERCEL</span>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/actions/auth";

type Props = {
  userName?: string | null;
  accountType?: "candidate" | "employer" | null;
};

export function SiteHeader({ userName, accountType }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--paper)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4">
        <Wordmark />
        <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--muted)] md:flex">
          <Link href="/jobs" className="hover:text-[var(--ink)]">
            Find work
          </Link>
          <Link href="/companies" className="hover:text-[var(--ink)]">
            Companies
          </Link>
          <Link href="/pricing" className="hover:text-[var(--ink)]">
            Pricing
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {userName ? (
            <>
              <span className="hidden text-sm text-[var(--muted)] sm:inline">
                {userName}
              </span>
              <Link href={accountType === "employer" ? "/dashboard" : "/profile"}>
                <Button variant="secondary" size="sm">
                  {accountType === "employer" ? "Dashboard" : "Profile"}
                </Button>
              </Link>
              <form action={signOutAction}>
                <Button type="submit" variant="ghost" size="sm">
                  Log out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

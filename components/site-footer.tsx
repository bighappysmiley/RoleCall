import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

export function SiteFooter() {
  return (
    <footer className="border-t border-line/70 bg-white/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Wordmark />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            RoleCall helps people find work and companies hire with clear,
            labeled placement.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-2 text-sm text-muted-foreground">
          {[
            { href: "/jobs", label: "Jobs" },
            { href: "/companies", label: "Companies" },
            { href: "/pricing", label: "Pricing" },
            { href: "/signup", label: "Create account" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 transition-colors hover:bg-fog hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

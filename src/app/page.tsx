import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="bg-[linear-gradient(180deg,var(--fog)_0%,var(--paper)_42%)]">
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.15fr_0.85fr] md:items-end md:py-24">
        <div>
          <p className="font-display text-5xl font-medium tracking-tight text-[var(--ink)] md:text-6xl">
            RoleCall
          </p>
          <h1 className="mt-4 max-w-xl text-2xl leading-snug text-[var(--ink)] md:text-3xl">
            Find work. Hire people. Keep the listing clear.
          </h1>
          <p className="mt-4 max-w-lg text-[var(--muted)]">
            Browse open roles, follow applications, and post jobs with ranked
            placement you can actually see.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/jobs">
              <Button>Browse jobs</Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary">Hire on RoleCall</Button>
            </Link>
          </div>
        </div>
        <div
          className="min-h-[220px] border border-[var(--line)] bg-[var(--paper)] bg-[linear-gradient(135deg,var(--fog)_0%,var(--paper)_55%,#e8eef8_100%)] p-5"
          aria-hidden="true"
        >
          <p className="font-mono-data text-xs uppercase tracking-wider text-[var(--muted)]">
            Open roles
          </p>
          <div className="mt-4 space-y-3">
            <div className="promotion-rail border border-[var(--line)] bg-[var(--paper)] p-3 pl-4" data-placement="featured">
              <p className="font-display text-base">Featured roles rise first</p>
              <p className="mt-1 font-mono-data text-xs text-[var(--muted)]">
                Clear labels · No silent boosts
              </p>
            </div>
            <div className="border border-[var(--line)] bg-[var(--paper)] p-3 pl-4">
              <p className="font-display text-base">Organic listings stay visible</p>
              <p className="mt-1 font-mono-data text-xs text-[var(--muted)]">
                Search · Filter · Apply
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

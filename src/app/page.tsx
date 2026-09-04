import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="bg-[linear-gradient(180deg,var(--fog)_0%,var(--paper)_42%)]">
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-end md:py-24">
        <div>
          <p className="font-display text-5xl font-medium tracking-tight text-[var(--ink)] md:text-6xl">
            RoleCall
          </p>
          <h1 className="mt-4 max-w-xl text-2xl leading-snug text-[var(--ink)] md:text-3xl">
            The hiring board that reads like a trade directory.
          </h1>
          <p className="mt-4 max-w-lg text-[var(--muted)]">
            Companies post roles. Candidates apply once. Paid placement is
            labeled — never silent.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/jobs">
              <Button>Browse jobs</Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary">Post a job</Button>
            </Link>
          </div>
        </div>
        <div className="border border-[var(--line)] bg-[var(--paper)] p-5">
          <p className="font-mono-data text-xs uppercase tracking-wider text-[var(--muted)]">
            Placement key
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="promotion-rail border border-[var(--line)] p-3 pl-4" data-placement="featured">
              <span className="font-mono-data text-xs">FEATURED</span>
              <span className="ml-2 text-[var(--muted)]">Pro Plus / Enterprise</span>
            </li>
            <li className="promotion-rail border border-[var(--line)] p-3 pl-4" data-placement="promoted">
              <span className="font-mono-data text-xs">PROMOTED</span>
              <span className="ml-2 text-[var(--muted)]">Ad credits</span>
            </li>
            <li className="promotion-rail border border-[var(--line)] p-3 pl-4" data-placement="pro">
              <span className="font-mono-data text-xs">PRO</span>
              <span className="ml-2 text-[var(--muted)]">Thin signal rail</span>
            </li>
            <li className="border border-[var(--line)] p-3 pl-4">
              <span className="font-mono-data text-xs">ORGANIC</span>
              <span className="ml-2 text-[var(--muted)]">No rail</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

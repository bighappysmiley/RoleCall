import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="bg-[linear-gradient(180deg,var(--fog)_0%,var(--paper)_48%)]">
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <p className="font-display text-5xl font-medium tracking-tight text-[var(--ink)] md:text-6xl">
          RoleCall
        </p>
        <h1 className="mt-4 max-w-2xl text-2xl leading-snug text-[var(--ink)] md:text-3xl">
          Find work. Hire people. Keep every listing clear.
        </h1>
        <p className="mt-4 max-w-xl text-[var(--muted)]">
          A hiring board for companies and candidates — browse roles, apply, and
          manage applicants in one place.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/jobs">
            <Button>Browse jobs</Button>
          </Link>
          <Link href="/signup">
            <Button variant="secondary">Hire on RoleCall</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

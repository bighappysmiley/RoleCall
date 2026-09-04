import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div>
      <section className="hero-glow border-b border-[var(--line)]">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <p className="anim-fade-up font-display text-5xl font-bold tracking-tight text-[var(--ink)] md:text-7xl">
            RoleCall
          </p>
          <h1 className="anim-fade-up anim-delay-1 mt-6 max-w-2xl text-3xl font-medium leading-[1.15] tracking-tight text-[var(--ink)] md:text-4xl">
            Hire great people. Find great work.
          </h1>
          <p className="anim-fade-up anim-delay-2 mt-5 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
            Discover open roles from real teams — or post a job and reach
            candidates who are ready to apply.
          </p>
          <div className="anim-fade-up anim-delay-3 mt-9 flex flex-wrap gap-3">
            <Link href="/jobs">
              <Button size="lg">Find a job</Button>
            </Link>
            <Link href="/signup?intent=employer">
              <Button size="lg" variant="secondary">
                Post a job
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--line)] bg-[var(--paper)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:gap-16 md:py-20">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Browse companies like a directory
            </h2>
            <p className="mt-4 text-[var(--muted)] leading-relaxed">
              See team profiles, pay ranges, and open roles at a glance — then
              apply when something fits.
            </p>
            <Link href="/companies" className="mt-6 inline-block">
              <Button variant="secondary">Explore companies</Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Product", tone: "#0f172a" },
              { label: "Engineering", tone: "#1d4ed8" },
              { label: "Design", tone: "#1e3a5f" },
              { label: "Ops", tone: "#0f766e" },
            ].map((tile, i) => (
              <div
                key={tile.label}
                className={`surface-card overflow-hidden ${i % 2 === 1 ? "mt-6" : ""}`}
              >
                <div
                  className="h-20"
                  style={{
                    background: `linear-gradient(145deg, ${tile.tone}, color-mix(in srgb, ${tile.tone} 55%, #94a3b8))`,
                  }}
                />
                <div className="p-3">
                  <p className="text-sm font-semibold">{tile.label}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">Teams hiring</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Built for both sides of hiring
          </h2>
          <p className="mt-4 text-[var(--muted)]">
            Candidates find clear listings. Employers get a simple place to post
            and manage roles.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Clear listings",
              body: "Salary, location, and role details up front — so people know what they’re applying to.",
            },
            {
              title: "Fair placement",
              body: "Featured and promoted roles are labeled. Organic listings stay visible.",
            },
            {
              title: "Simple plans",
              body: "Start free. Upgrade when you need more open roles, seats, or stronger placement.",
            },
          ].map((item) => (
            <div key={item.title} className="surface-card p-6">
              <h3 className="font-display text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {item.body}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/pricing">
            <Button size="lg" variant="secondary">
              See hiring plans
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

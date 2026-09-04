import { PLAN_LIMITS } from "@/lib/plans";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const tiers = ["free", "pro", "pro_plus", "enterprise"] as const;

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-medium tracking-tight">
        Pricing
      </h1>
      <p className="mt-2 max-w-2xl text-[var(--muted)]">
        Start free. Upgrade when you need more open roles, seats, or stronger
        placement in search.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((key) => {
          const plan = PLAN_LIMITS[key];
          return (
            <div
              key={key}
              className="border border-[var(--line)] bg-[var(--paper)] p-5"
            >
              <h2 className="font-display text-xl font-medium">{plan.label}</h2>
              <p className="mt-2 font-mono-data text-2xl">{plan.priceLabel}</p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                <li>
                  Active jobs:{" "}
                  <span className="font-mono-data text-[var(--ink)]">
                    {plan.activeJobs ?? "Unlimited"}
                  </span>
                </li>
                <li>
                  Team seats:{" "}
                  <span className="font-mono-data text-[var(--ink)]">
                    {plan.seats ?? "Unlimited"}
                  </span>
                </li>
                <li>
                  Search ranking:{" "}
                  <span className="font-mono-data text-[var(--ink)]">
                    {key === "free"
                      ? "Standard"
                      : key === "pro"
                        ? "Boosted"
                        : "Featured"}
                  </span>
                </li>
                {(key === "pro_plus" || key === "enterprise") && (
                  <li>Pinned above organic results</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-10 border border-[var(--line)] bg-[var(--fog)] p-6">
        <p className="font-display text-lg">Ready to hire?</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Create an employer account and open your company dashboard.
        </p>
        <Link href="/signup" className="mt-4 inline-block">
          <Button>Create employer account</Button>
        </Link>
      </div>
    </div>
  );
}

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
        Limits are enforced when you publish jobs or invite teammates. Checkout
        is not enabled yet — plans are informational for Phase 1.
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
                  Ranking:{" "}
                  <span className="font-mono-data text-[var(--ink)]">
                    {key === "free"
                      ? "1.0×"
                      : key === "pro"
                        ? "1.5×"
                        : "2.5×"}
                  </span>
                </li>
                {(key === "pro_plus" || key === "enterprise") && (
                  <li>Featured placement rail</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-10 border border-[var(--line)] bg-[var(--fog)] p-6">
        <p className="font-display text-lg">Hiring on RoleCall?</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Create an employer account to open your dashboard.
        </p>
        <Link href="/signup" className="mt-4 inline-block">
          <Button>Sign up as employer</Button>
        </Link>
      </div>
    </div>
  );
}

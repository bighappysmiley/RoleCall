import Link from "next/link";
import { PLAN_LIMITS } from "@/lib/plans";
import { Button } from "@/components/ui/button";

const plans = [
  {
    key: "free" as const,
    title: "Free",
    blurb: "Browse the board and post a couple of roles to get started.",
    cta: "Get started",
    href: "/signup",
    points: [
      "Browse open roles and companies",
      "Post up to 2 active jobs",
      "Invite up to 2 teammates",
      "Standard search placement",
    ],
  },
  {
    key: "pro" as const,
    title: "Post a job",
    blurb: "Reach candidates looking for full-time, part-time, or contract roles.",
    cta: "Post a job",
    href: "/signup?intent=employer",
    points: [
      "Post up to 10 active jobs",
      "Invite up to 5 teammates",
      "Boosted search ranking",
      "Custom careers domain",
      "No placement fees",
    ],
  },
  {
    key: "pro_plus" as const,
    title: "Hiring Suite",
    blurb: "Stand out with featured placement and more room to hire.",
    cta: "Get Hiring Suite",
    href: "/signup?intent=employer",
    highlight: true,
    points: [
      "Post up to 40 active jobs",
      "Invite up to 15 teammates",
      "Featured placement above organic results",
      "Full hiring analytics",
      "Priority support",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Find the perfect plan for hiring
        </h1>
        <p className="mt-4 text-lg text-[var(--muted)]">
          Start free. Upgrade when you need more open roles, more seats, or
          stronger placement on the board.
        </p>
      </div>

      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const meta = PLAN_LIMITS[plan.key];
          const isFree = plan.key === "free";
          return (
            <div
              key={plan.key}
              className={`surface-card flex flex-col p-8 ${
                plan.highlight
                  ? "border-[var(--primary)]"
                  : ""
              }`}
            >
              {plan.highlight ? (
                <span className="badge badge-promoted mb-3 w-fit">Popular</span>
              ) : (
                <span className="mb-3 block h-6" />
              )}
              <h2 className="font-display text-2xl font-semibold">{plan.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {plan.blurb}
              </p>
              <p className="mt-6 font-display text-5xl font-semibold tracking-tight">
                {isFree ? "$0" : meta.priceLabel.replace("/mo", "")}
                {!isFree ? (
                  <span className="ml-1 text-base font-medium text-[var(--muted)]">
                    /month
                  </span>
                ) : null}
              </p>
              <ul className="mt-8 flex-1 space-y-3 text-sm text-[var(--muted)]">
                {plan.points.map((point) => (
                  <li key={point} className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-[2px] bg-[var(--primary)]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.href} className="mt-8 block">
                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "secondary"}
                >
                  {plan.cta}
                </Button>
              </Link>
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Cancel anytime
              </p>
            </div>
          );
        })}
      </div>

      <div className="surface-card mt-8 flex flex-col gap-4 p-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Enterprise</h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
            Unlimited roles and seats, dedicated support, and custom onboarding
            for larger hiring teams.
          </p>
        </div>
        <Link href="/signup?intent=employer">
          <Button variant="secondary">Talk with us</Button>
        </Link>
      </div>
    </div>
  );
}

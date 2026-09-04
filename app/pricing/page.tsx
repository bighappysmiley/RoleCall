import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pricing",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
        PLANS
      </p>
      <h1 className="mt-2 font-heading text-4xl">Pricing</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Job and seat limits are already enforced. Checkout and upgrades come
        later. You can sign up for free today.
      </p>
      <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className="flex flex-col border border-line bg-paper p-5"
          >
            <p className="font-mono text-[11px] tracking-wider text-muted-foreground">
              {plan.name.toUpperCase()}
            </p>
            <p className="mt-2 font-heading text-3xl">
              {plan.priceLabel}
              {plan.priceCents != null && plan.priceCents > 0 ? (
                <span className="text-base text-muted-foreground"> /mo</span>
              ) : null}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{plan.blurb}</p>
            <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm">
              {plan.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Button className="mt-6 w-full" variant={plan.id === "pro" ? "default" : "outline"} asChild>
              <Link href="/signup">{plan.id === "enterprise" ? "Talk to us" : "Start"}</Link>
            </Button>
          </article>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Any tier can buy $10 / $25 / $100 ad-credit packs to promote a job under
        featured listings.
      </p>
    </div>
  );
}

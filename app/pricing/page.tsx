import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getOptionalSession } from "@/lib/auth/server";
import { AD_CREDIT_PACKS, PLANS, PROMOTION_PACKS } from "@/lib/plans";
import { ensureProfile } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Pricing",
};

export default async function PricingPage() {
  const session = await getOptionalSession();
  const profile = session?.user
    ? await ensureProfile({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      })
    : null;
  const hiringCta =
    profile?.accountType === "employer" || profile?.isPlatformAdmin
      ? "/dashboard/billing"
      : session?.user
        ? "/dashboard"
        : "/signup";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <p className="text-sm font-medium tracking-[0.08em] text-primary uppercase">
        Pricing
      </p>
      <h1 className="mt-2 max-w-2xl font-display text-4xl tracking-[-0.04em] sm:text-5xl">
        Plans that stay clear and fair.
      </h1>
      <p className="mt-4 max-w-xl text-base text-muted-foreground">
        Start free with room to hire. Upgrade when you need more open roles,
        teammates, or stronger placement on the board.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => {
          const href =
            plan.id === "enterprise"
              ? "mailto:hello@bighappysmiley.com"
              : hiringCta;
          const label =
            plan.id === "enterprise"
              ? "Talk to us"
              : session?.user
                ? "Go to billing"
                : "Get started";
          return (
            <article
              key={plan.id}
              className="flex flex-col border border-line bg-white/90 p-6 transition-colors hover:border-primary/25"
            >
              <p className="text-sm font-medium text-primary">{plan.name}</p>
              <p className="mt-3 font-display text-4xl tracking-[-0.04em]">
                {plan.priceLabel}
                {plan.priceCents != null && plan.priceCents > 0 ? (
                  <span className="text-base font-sans tracking-normal text-muted-foreground">
                    /mo
                  </span>
                ) : null}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {plan.blurb}
              </p>
              <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-ink/85">
                {plan.highlights.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8 w-full"
                variant={plan.id === "pro" ? "default" : "outline"}
                asChild
              >
                <Link href={href}>{label}</Link>
              </Button>
            </article>
          );
        })}
      </div>
      <section className="mt-12 border border-line bg-white/90 px-6 py-8">
        <h2 className="font-display text-2xl tracking-[-0.03em]">
          One-time promotion packs
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Give a published role more visibility for a set number of days. Every
          promoted listing stays clearly labeled on the board.
        </p>
        <ul className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          {PROMOTION_PACKS.map((pack, index) => (
            <li
              key={pack.cents}
              className="border border-line bg-paper/80 px-4 py-3"
            >
              <p className="font-display text-lg tracking-[-0.03em]">
                {AD_CREDIT_PACKS[index]?.label}
              </p>
              <p className="mt-1 text-muted-foreground">
                {pack.label} on the board
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

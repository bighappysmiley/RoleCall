import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getOptionalSession } from "@/lib/auth/server";
import { AD_CREDIT_PACKS, PLANS, PROMOTION_PACKS } from "@/lib/plans";
import { ensureProfile } from "@/lib/queries";
import { cn } from "@/lib/utils";

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
    <div className="page-shell">
      <p className="eyebrow">Pricing</p>
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
          const featured = plan.id === "pro";
          return (
            <article
              key={plan.id}
              className={cn(
                "surface surface-hover relative flex flex-col p-6",
                featured &&
                  "border-primary/35 bg-[linear-gradient(165deg,rgb(13_115_119/0.08),white_42%)] shadow-[var(--shadow-lift)] xl:-translate-y-2",
              )}
            >
              {featured ? (
                <span className="absolute top-4 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
                  Popular
                </span>
              ) : null}
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
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8 h-10 w-full rounded-xl"
                variant={featured ? "default" : "outline"}
                asChild
              >
                <Link href={href}>{label}</Link>
              </Button>
            </article>
          );
        })}
      </div>
      <section className="surface mt-12 px-6 py-8 sm:px-8">
        <h2 className="font-display text-2xl tracking-[-0.03em]">
          One-time promotion packs
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Give a published role more visibility for a set number of days. Every
          promoted listing stays clearly labeled on the board.
        </p>
        <ul className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
          {PROMOTION_PACKS.map((pack, index) => (
            <li
              key={pack.cents}
              className="rounded-2xl border border-line/80 bg-paper/70 px-4 py-4 transition-colors hover:border-primary/25 hover:bg-white"
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

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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
        PLANS
      </p>
      <h1 className="mt-2 font-heading text-4xl">Pricing</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Job and seat limits are enforced today. Checkout uses Stripe test mode
        until you flip to live keys. Test cards do not charge real money.
      </p>
      <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => {
          const href =
            plan.id === "enterprise"
              ? "mailto:hf@bighappysmiley.com"
              : hiringCta;
          const label =
            plan.id === "enterprise"
              ? "Talk to us"
              : session?.user
                ? "Go to billing"
                : "Start";
          return (
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
              <Button
                className="mt-6 w-full"
                variant={plan.id === "pro" ? "default" : "outline"}
                asChild
              >
                <Link href={href}>{label}</Link>
              </Button>
            </article>
          );
        })}
      </div>
      <section className="mt-10 border border-line p-5">
        <h2 className="font-heading text-2xl">Ad credits</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Any tier can buy a one-time pack and promote a published job under
          Featured. Duration matches the pack.
        </p>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          {PROMOTION_PACKS.map((pack, index) => (
            <li key={pack.cents} className="border border-line px-3 py-2">
              {AD_CREDIT_PACKS[index]?.label} · {pack.label} on the board
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

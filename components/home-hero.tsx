"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Mode = "hired" | "hire";

const HIRED = {
  phrases: [
    "Share your work and get hired",
    "Offer your services and get hired",
    "Build your profile and get hired",
    "Show your craft and get hired",
  ],
  bullets: [
    "Browse a live board where paid placement stays labeled",
    "Apply in minutes with a focused profile",
    "Follow companies and roles that match your craft",
  ],
  primary: { href: "/jobs", label: "Browse jobs" },
  secondary: { href: "/signup", label: "Create a profile" },
};

const HIRE = {
  prefix: "Work with the world's best in",
  phrases: ["design", "engineering", "product", "marketing", "operations"],
  bullets: [
    "Post a role and review applicants in one place",
    "Promote listings with placement that stays clearly labeled",
    "Invite teammates and hire with plans that stay fair",
  ],
  primary: { href: "/signup", label: "Post a job" },
  secondary: { href: "/pricing", label: "See pricing" },
};

function RotatingText({
  phrases,
  className,
}: {
  phrases: string[];
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % phrases.length);
        setVisible(true);
      }, 280);
    }, 3200);
    return () => window.clearInterval(id);
  }, [phrases.length]);

  return (
    <span
      className={cn(
        "inline-block transition-all duration-300 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        className,
      )}
    >
      {phrases[index]}
    </span>
  );
}

export function HomeHero() {
  const [mode, setMode] = useState<Mode>("hired");
  const content = mode === "hired" ? HIRED : HIRE;

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 size-[34rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-32 -left-16 size-72 rounded-full bg-mist/80 blur-3xl" />
        <div className="absolute top-40 -right-10 size-80 rounded-full bg-signal/10 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-paper" />
      </div>

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pt-14 pb-20 text-center sm:pt-20 sm:pb-24">
        <div className="inline-flex rounded-full border border-line/80 bg-fog/70 p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setMode("hired")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-all sm:px-5",
              mode === "hired"
                ? "bg-white text-ink shadow-sm"
                : "text-muted-foreground hover:text-ink",
            )}
          >
            Get hired
          </button>
          <button
            type="button"
            onClick={() => setMode("hire")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-all sm:px-5",
              mode === "hire"
                ? "bg-white text-ink shadow-sm"
                : "text-muted-foreground hover:text-ink",
            )}
          >
            Hire talent
          </button>
        </div>

        <h1 className="mt-10 max-w-3xl font-display text-[clamp(2rem,5.5vw,3.5rem)] leading-[1.12] font-semibold tracking-[-0.045em] text-ink text-balance">
          {mode === "hired" ? (
            <RotatingText phrases={HIRED.phrases} className="text-primary" />
          ) : (
            <>
              <span className="text-ink">{HIRE.prefix} </span>
              <RotatingText phrases={HIRE.phrases} className="text-primary" />
            </>
          )}
        </h1>

        <ul className="mt-8 flex w-full max-w-xl flex-col gap-3 text-left">
          {content.bullets.map((bullet) => (
            <li
              key={bullet}
              className="flex items-start gap-3 rounded-2xl border border-line/70 bg-white/80 px-4 py-3 text-sm leading-relaxed text-ink/80 shadow-sm"
            >
              <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                <Check className="size-3.5 stroke-[2.5]" />
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full px-7 text-base shadow-[0_8px_28px_rgb(13_115_119/0.28)]"
          >
            <Link href={content.primary.href}>{content.primary.label}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 rounded-full border-line bg-white px-7 text-base"
          >
            <Link href={content.secondary.href}>{content.secondary.label}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

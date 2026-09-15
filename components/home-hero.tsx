"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Mode = "hire" | "hired";

const HIRED = {
  lead: [
    "Browse openings",
    "Apply to roles",
    "Update your profile",
    "Find your next job",
  ],
  rest: "and get hired.",
  bullets: [
    "Search a live board where paid placement stays clearly labeled",
    "Apply to real openings in minutes",
    "Keep a profile ready for the next role",
  ],
  primary: { href: "/jobs", label: "Browse Jobs" },
  secondary: { href: "/signup", label: "Create a Profile" },
};

const HIRE = {
  prefix: "Hire great people in",
  lead: ["design", "engineering", "product", "marketing", "operations"],
  bullets: [
    "Post a role and review applicants in one place",
    "Promote listings with placement that stays labeled",
    "Invite teammates and hire on a clear plan",
  ],
  primary: { href: "/signup", label: "Post a Job" },
  secondary: { href: "/pricing", label: "See Pricing" },
};

function RotatingPhrase({
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
      }, 220);
    }, 3000);
    return () => window.clearInterval(id);
  }, [phrases.length]);

  return (
    <span
      className={cn(
        "inline-block transition-all duration-200 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
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
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-10 lg:grid-cols-2 lg:gap-12 lg:pt-14 lg:pb-12">
        <div className="max-w-xl">
          <div className="inline-flex rounded-full bg-fog p-1">
            <button
              type="button"
              onClick={() => setMode("hire")}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors",
                mode === "hire"
                  ? "bg-white text-ink shadow-sm"
                  : "text-muted-foreground hover:text-ink",
              )}
            >
              Hire Talent
            </button>
            <button
              type="button"
              onClick={() => setMode("hired")}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors",
                mode === "hired"
                  ? "bg-white text-ink shadow-sm"
                  : "text-muted-foreground hover:text-ink",
              )}
            >
              Get Hired
            </button>
          </div>

          <h1 className="mt-7 font-sans text-[clamp(2.1rem,4.2vw,3.35rem)] leading-[1.15] font-bold tracking-[-0.035em] text-ink text-balance">
            {mode === "hired" ? (
              <>
                <RotatingPhrase phrases={HIRED.lead} className="text-primary" />{" "}
                <span>{HIRED.rest}</span>
              </>
            ) : (
              <>
                <span>{HIRE.prefix} </span>
                <RotatingPhrase phrases={HIRE.lead} className="text-primary" />
                <span>.</span>
              </>
            )}
          </h1>

          <ul className="mt-7 space-y-3.5">
            {content.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-3 text-[15px] leading-relaxed text-ink/75"
              >
                <Check
                  className="mt-0.5 size-4 shrink-0 text-primary stroke-[2.5]"
                  aria-hidden
                />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-11 rounded-full bg-ink px-5 text-[15px] text-white hover:bg-ink/90"
            >
              <Link href={content.primary.href}>
                {content.primary.label}
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 rounded-full border-line bg-white px-5 text-[15px] text-ink hover:bg-fog"
            >
              <Link href={content.secondary.href}>{content.secondary.label}</Link>
            </Button>
          </div>
        </div>

        <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[1.75rem] bg-fog lg:aspect-auto lg:min-h-[26rem]">
          <Image
            src="/hero-workspace.jpg"
            alt="People collaborating at a desk"
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 520px"
          />
        </div>
      </div>
    </section>
  );
}

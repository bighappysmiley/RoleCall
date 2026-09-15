"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { CompanyMark } from "@/components/company-mark";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { NameWithBadge } from "@/components/badge-icon";
import type { CompanyRecord, ProfileRecord, RankedJob } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = "jobs" | "companies" | "people";

const TABS: { id: Tab; label: string }[] = [
  { id: "jobs", label: "Jobs" },
  { id: "companies", label: "Companies" },
  { id: "people", label: "People" },
];

const POPULAR: Record<Tab, string[]> = {
  jobs: [
    "product design",
    "frontend",
    "remote",
    "marketing",
    "operations",
    "fullstack",
    "customer success",
  ],
  companies: [
    "startups",
    "fintech",
    "healthcare",
    "remote-first",
    "saas",
    "consumer",
    "climate",
  ],
  people: [
    "designers",
    "engineers",
    "product managers",
    "marketers",
    "operators",
    "recruiters",
  ],
};

const PLACEHOLDERS: Record<Tab, string> = {
  jobs: "What kind of role are you looking for?",
  companies: "What kind of company are you looking for?",
  people: "What kind of people are you looking for?",
};

function matchesQuery(haystack: string, query: string) {
  if (!query) return true;
  return haystack.toLowerCase().includes(query.toLowerCase());
}

export function HomeDiscovery({
  jobs,
  companies,
  people,
}: {
  jobs: RankedJob[];
  companies: CompanyRecord[];
  people: ProfileRecord[];
}) {
  const [tab, setTab] = useState<Tab>("jobs");
  const [query, setQuery] = useState("");

  const filteredJobs = useMemo(() => {
    const q = query.trim();
    return jobs
      .filter((job) =>
        matchesQuery(
          [
            job.title,
            job.company.name,
            job.location ?? "",
            job.department ?? "",
            ...(job.skills ?? []),
          ].join(" "),
          q,
        ),
      )
      .slice(0, 12);
  }, [jobs, query]);

  const filteredPeople = useMemo(() => {
    const q = query.trim();
    return people
      .filter((person) =>
        matchesQuery(
          [person.fullName ?? "", person.headline ?? "", person.location ?? ""].join(" "),
          q,
        ),
      )
      .slice(0, 12);
  }, [people, query]);

  const filteredCompanies = useMemo(() => {
    const q = query.trim();
    return companies
      .filter((company) =>
        matchesQuery(
          [
            company.name,
            company.tagline ?? "",
            company.industry ?? "",
            company.locations.join(" "),
          ].join(" "),
          q,
        ),
      )
      .slice(0, 12);
  }, [companies, query]);

  const searchAction =
    tab === "companies" ? "/companies" : tab === "people" ? "/people" : "/jobs";

  const popularHref = (tag: string) => {
    if (tab === "companies") {
      return `/companies?q=${encodeURIComponent(tag)}`;
    }
    if (tab === "people") {
      return `/people?q=${encodeURIComponent(tag)}`;
    }
    return `/jobs?q=${encodeURIComponent(tag)}`;
  };

  return (
    <section className="border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-16">
        <div className="flex flex-wrap items-center gap-5 text-sm">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setTab(item.id);
                setQuery("");
              }}
              className={cn(
                "pb-2 text-[15px] transition-colors",
                tab === item.id
                  ? "border-b-2 border-ink font-semibold text-ink"
                  : "text-muted-foreground hover:text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <form
          method="get"
          action={searchAction}
          className="mt-4 flex items-center gap-2 rounded-full bg-fog px-2 py-2 pl-5"
          onSubmit={(event) => {
            // Keep browsing on the home page when filtering jobs/companies locally.
            if (tab === "jobs" || tab === "companies" || tab === "people") {
              event.preventDefault();
            }
          }}
        >
          <input
            name="q"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={PLACEHOLDERS[tab]}
            className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted-foreground"
          />
          <Button
            type="submit"
            size="icon"
            className="size-11 shrink-0 rounded-full bg-primary text-white hover:bg-primary/90"
            aria-label="Search"
          >
            <Search className="size-4" />
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Popular:</span>
          {POPULAR[tab].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                if (tab === "people") {
                  setQuery(tag);
                  return;
                }
                setQuery(tag);
              }}
              className={cn(
                "rounded-full border border-line bg-white px-3 py-1 text-[13px] text-ink/80 transition-colors hover:border-primary/30 hover:text-ink",
                query === tag && "border-primary/40 bg-primary/5 text-ink",
              )}
            >
              {tag}
            </button>
          ))}
          {/* Keep crawlable links for SEO */}
          <span className="sr-only">
            {POPULAR[tab].map((tag) => (
              <Link key={tag} href={popularHref(tag)}>
                {tag}
              </Link>
            ))}
          </span>
        </div>

        <div className="mt-8">
          {tab === "jobs" ? (
            filteredJobs.length === 0 ? (
              <EmptyState
                title="No jobs match that search"
                body="Try another keyword, or browse the full jobs board."
                href="/jobs"
                label="Browse all jobs"
              />
            ) : (
              <div className="grid gap-3">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )
          ) : null}

          {tab === "companies" ? (
            filteredCompanies.length === 0 ? (
              <EmptyState
                title="No companies match that search"
                body="Try another keyword, or browse the company directory."
                href="/companies"
                label="Browse companies"
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredCompanies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/companies/${company.slug}`}
                    className="flex gap-4 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-primary/30"
                  >
                    <CompanyMark
                      name={company.name}
                      logoUrl={company.logoUrl}
                      className="size-12 text-sm"
                    />
                    <div className="min-w-0">
                      <h2 className="font-display text-xl tracking-[-0.03em]">
                        <NameWithBadge
                          name={company.name}
                          badge={company.pinnedBadge}
                          badgeSize={18}
                        />
                      </h2>
                      {company.tagline ? (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {company.tagline}
                        </p>
                      ) : null}
                      <p className="mt-3 text-xs tracking-wide text-muted-foreground">
                        {company.industry ?? "Company"}
                        {company.locations[0] ? ` · ${company.locations[0]}` : ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : null}

          {tab === "people" ? (
            filteredPeople.length === 0 ? (
              <EmptyState
                title="No people match that search"
                body="Try another keyword, or create a profile so you can show up here."
                href="/profile"
                label="Update your profile"
              />
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredPeople.map((person) => (
                    <Link
                      key={person.id}
                      href={`/people/${person.id}`}
                      className="flex gap-4 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-primary/30"
                    >
                      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-fog text-sm font-medium text-ink">
                        {person.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={person.avatarUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          (person.fullName ?? "?").slice(0, 1)
                        )}
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-display text-xl tracking-[-0.03em]">
                          <NameWithBadge name={person.fullName ?? "Member"} />
                        </h2>
                        {person.headline ? (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {person.headline}
                          </p>
                        ) : null}
                        {person.location ? (
                          <p className="mt-3 text-xs tracking-wide text-muted-foreground">
                            {person.location}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="text-center">
                  <Link
                    href={query.trim() ? `/people?q=${encodeURIComponent(query.trim())}` : "/people"}
                    className="text-sm text-primary hover:underline"
                  >
                    Browse all people
                  </Link>
                </div>
              </div>
            )
          ) : null}
        </div>
      </div>
    </section>
  );
}

function EmptyState({
  title,
  body,
  href,
  label,
}: {
  title: string;
  body: string;
  href: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-fog/40 px-6 py-10 text-center">
      <p className="text-base font-medium text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
      <Button asChild className="mt-5 rounded-full" size="sm">
        <Link href={href}>{label}</Link>
      </Button>
    </div>
  );
}

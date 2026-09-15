import type { Metadata } from "next";
import Link from "next/link";
import { NameWithBadge } from "@/components/badge-icon";
import { CompanyMark } from "@/components/company-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listCompanies, listPublishedJobs } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Companies",
};

export const dynamic = "force-dynamic";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const q = raw?.trim() ?? "";
  const [companies, jobs] = await Promise.all([
    listCompanies(),
    listPublishedJobs(),
  ]);
  const counts = new Map<string, number>();
  for (const job of jobs) {
    counts.set(job.companyId, (counts.get(job.companyId) ?? 0) + 1);
  }

  const needle = q.toLowerCase();
  const filtered = needle
    ? companies.filter((company) => {
        const haystack = [
          company.name,
          company.tagline ?? "",
          company.industry ?? "",
          company.locations.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(needle);
      })
    : companies;

  return (
    <div className="page-shell">
      <p className="eyebrow">Directory</p>
      <h1 className="mt-2 font-display text-4xl tracking-[-0.04em] sm:text-5xl">
        Companies
      </h1>
      <p className="mt-3 max-w-xl text-base text-muted-foreground">
        Meet the teams hiring on RoleCall.
      </p>
      <form
        method="get"
        action="/companies"
        className="surface mt-8 flex flex-wrap items-end gap-3 p-4 sm:p-5"
      >
        <div className="grid min-w-[16rem] flex-1 gap-1.5">
          <label
            htmlFor="q"
            className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase"
          >
            Search
          </label>
          <Input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Name, industry, location"
            className="h-10 rounded-xl bg-white"
          />
        </div>
        <Button type="submit" className="h-10 rounded-xl px-5">
          Search
        </Button>
        {q ? (
          <Button type="button" variant="outline" className="h-10 rounded-xl" asChild>
            <Link href="/companies">Clear</Link>
          </Button>
        ) : null}
      </form>
      {filtered.length === 0 ? (
        <div className="surface mt-10 px-6 py-10 text-sm text-muted-foreground">
          <p>
            {q
              ? "No companies match that search."
              : "No companies yet. Hiring teams appear here after they create a profile."}
          </p>
          {q ? (
            <Button className="mt-4" size="sm" variant="outline" asChild>
              <Link href="/companies">Clear search</Link>
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {filtered.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.slug}`}
              className="surface surface-hover flex gap-4 p-5"
            >
              <CompanyMark
                name={company.name}
                logoUrl={company.logoUrl}
                className="size-12 text-sm"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl tracking-[-0.03em]">
                    <NameWithBadge
                      name={company.name}
                      badge={company.pinnedBadge}
                      badgeSize={18}
                    />
                  </h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {company.tagline}
                </p>
                <p className="mt-3 text-xs tracking-wide text-muted-foreground">
                  {counts.get(company.id) ?? 0} open
                  {company.industry ? ` · ${company.industry}` : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

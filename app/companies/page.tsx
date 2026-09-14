import type { Metadata } from "next";
import Link from "next/link";
import { CompanyMark } from "@/components/company-mark";
import { listCompanies, listPublishedJobs } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Companies",
};

export default async function CompaniesPage() {
  const [companies, jobs] = await Promise.all([
    listCompanies(),
    listPublishedJobs(),
  ]);
  const counts = new Map<string, number>();
  for (const job of jobs) {
    counts.set(job.companyId, (counts.get(job.companyId) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <p className="text-sm font-medium tracking-[0.08em] text-primary uppercase">
        Directory
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-[-0.04em] sm:text-5xl">
        Companies
      </h1>
      <p className="mt-3 max-w-xl text-base text-muted-foreground">
        Meet the teams hiring on RoleCall.
      </p>
      {companies.length === 0 ? (
        <p className="mt-10 border border-line bg-white/80 px-5 py-8 text-sm text-muted-foreground">
          No companies yet. Hiring teams appear here after they create a
          profile.
        </p>
      ) : (
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.slug}`}
              className="flex gap-4 border border-line bg-white/90 p-5 transition-colors hover:border-primary/30 hover:bg-white"
            >
              <CompanyMark
                name={company.name}
                logoUrl={company.logoUrl}
                className="size-12 text-sm"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl tracking-[-0.03em]">
                    {company.name}
                  </h2>
                  {company.isVerified ? (
                    <span className="text-[11px] font-medium tracking-wide text-primary">
                      Verified
                    </span>
                  ) : null}
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

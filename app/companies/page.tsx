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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
        DIRECTORY
      </p>
      <h1 className="mt-2 font-heading text-4xl">Companies</h1>
      {companies.length === 0 ? (
        <p className="mt-8 border border-line bg-fog px-4 py-6 text-sm text-muted-foreground">
          No companies yet. Hiring teams show up here after they create a profile.
        </p>
      ) : (
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {companies.map((company) => (
          <Link
            key={company.id}
            href={`/companies/${company.slug}`}
            className="flex gap-4 border border-line bg-paper p-4 hover:bg-fog"
          >
            <CompanyMark name={company.name} className="size-12 text-sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-xl">{company.name}</h2>
                {company.isVerified ? (
                  <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                    VERIFIED
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{company.tagline}</p>
              <p className="mt-3 font-mono text-[11px] tracking-wide text-muted-foreground">
                {counts.get(company.id) ?? 0} OPEN
                {company.industry ? ` · ${company.industry.toUpperCase()}` : ""}
              </p>
            </div>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompanyMark } from "@/components/company-mark";
import { JobCard } from "@/components/job-card";
import { getCompanyBySlug, listCompanyJobs } from "@/lib/queries";
import { effectiveTier } from "@/lib/plans";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  return { title: company?.name ?? "Company" };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) {
    notFound();
  }
  const jobs = await listCompanyJobs(company.id);
  const tier = effectiveTier(company.subscriptionTier, company.overrideTier);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-6 border border-line bg-paper p-6 sm:flex-row">
        <CompanyMark name={company.name} className="size-16 text-lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-4xl">{company.name}</h1>
            {company.isVerified ? (
              <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                VERIFIED
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-muted-foreground">{company.tagline}</p>
          <p className="mt-4 max-w-2xl text-sm leading-6">{company.description}</p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] tracking-wide text-muted-foreground">
            {company.industry ? <span>{company.industry.toUpperCase()}</span> : null}
            {company.sizeRange ? <span>{company.sizeRange}</span> : null}
            {company.foundedYear ? <span>EST. {company.foundedYear}</span> : null}
            <span>TIER {tier.replace("_", " ").toUpperCase()}</span>
            {company.website ? (
              <Link href={company.website} className="text-primary">
                WEBSITE
              </Link>
            ) : null}
          </div>
        </div>
      </div>
      {company.benefits.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {company.benefits.map((benefit) => (
            <li
              key={benefit}
              className="border border-line px-2 py-1 font-mono text-[11px] tracking-wide"
            >
              {benefit}
            </li>
          ))}
        </ul>
      ) : null}
      <h2 className="mt-10 font-heading text-2xl">Open roles</h2>
      <div className="mt-4 grid gap-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}

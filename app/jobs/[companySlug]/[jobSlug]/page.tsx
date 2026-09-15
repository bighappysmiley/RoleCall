import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplyForm, SaveJobButton } from "@/components/apply-form";
import { NameWithBadge } from "@/components/badge-icon";
import { CompanyMark } from "@/components/company-mark";
import { JobCard } from "@/components/job-card";
import { PromotionRail } from "@/components/promotion-rail";
import { Button } from "@/components/ui/button";
import { getOptionalSession } from "@/lib/auth/server";
import {
  ensureProfile,
  getExistingApplication,
  getJobBySlugs,
  isJobSaved,
  listRelatedJobs,
  recordJobView,
} from "@/lib/queries";
import { railFor } from "@/lib/ranking";
import {
  formatEmployment,
  formatPostedAt,
  formatSalary,
  formatWorkplace,
} from "@/lib/format";

type Params = { companySlug: string; jobSlug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { companySlug, jobSlug } = await params;
  const job = await getJobBySlugs(companySlug, jobSlug);
  if (!job || job.status !== "published") {
    return { title: "Job" };
  }
  return { title: `${job.title} at ${job.company.name}` };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { companySlug, jobSlug } = await params;
  const session = await getOptionalSession();
  const job = await getJobBySlugs(companySlug, jobSlug, session?.user?.id);
  if (!job) {
    notFound();
  }

  const profile = session?.user
    ? await ensureProfile({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      })
    : null;

  if (job.status === "published") {
    await recordJobView(job.id, session?.user?.id);
  }

  const [applied, saved, related] = await Promise.all([
    session?.user
      ? Boolean(await getExistingApplication(job.id, session.user.id))
      : Promise.resolve(false),
    session?.user
      ? isJobSaved(job.id, session.user.id)
      : Promise.resolve(false),
    job.status === "published" ? listRelatedJobs(job, 4) : Promise.resolve([]),
  ]);

  const rail = railFor(job);
  const salary = formatSalary({
    min: job.salaryMin,
    max: job.salaryMax,
    currency: job.salaryCurrency,
    period: job.salaryPeriod,
    show: job.showSalary,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="relative border border-line bg-paper">
          <PromotionRail rail={rail} />
          <div className="px-5 py-6 sm:px-8">
            <div className="flex items-start gap-3">
              <CompanyMark
                name={job.company.name}
                logoUrl={job.company.logoUrl}
                className="size-11 text-sm"
              />
              <div>
                <p className="text-sm text-muted-foreground">
                  <Link
                    href={`/companies/${job.company.slug}`}
                    className="hover:text-ink"
                  >
                    <NameWithBadge
                      name={job.company.name}
                      badge={job.company.pinnedBadge}
                      badgeSize={16}
                    />
                  </Link>
                </p>
                <h1 className="mt-1 font-heading text-3xl sm:text-4xl">
                  {job.title}
                </h1>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] tracking-wide text-muted-foreground">
              <span>{formatEmployment(job.employmentType)}</span>
              <span>{formatWorkplace(job.workplaceType)}</span>
              {job.location ? <span>{job.location}</span> : null}
              {job.department ? <span>{job.department}</span> : null}
              {job.experienceLevel ? <span>{job.experienceLevel}</span> : null}
              {salary ? <span>{salary}</span> : null}
              <span>{formatPostedAt(job.publishedAt)}</span>
            </div>
            {job.skills.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <li
                    key={skill}
                    className="border border-line px-2 py-1 text-[12px] text-ink/80"
                  >
                    <Link
                      href={`/jobs?skill=${encodeURIComponent(skill)}`}
                      className="hover:text-primary"
                    >
                      {skill}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="prose-rolecall mt-8 space-y-6 text-sm leading-6">
              <section>
                <h2 className="font-heading text-xl">The role</h2>
                <p className="mt-2 whitespace-pre-wrap text-ink/90">
                  {job.description}
                </p>
              </section>
              {job.responsibilities ? (
                <section>
                  <h2 className="font-heading text-xl">You will</h2>
                  <p className="mt-2 whitespace-pre-wrap text-ink/90">
                    {job.responsibilities}
                  </p>
                </section>
              ) : null}
              {job.requirements ? (
                <section>
                  <h2 className="font-heading text-xl">You have</h2>
                  <p className="mt-2 whitespace-pre-wrap text-ink/90">
                    {job.requirements}
                  </p>
                </section>
              ) : null}
            </div>
          </div>
        </article>
        <aside className="h-fit border border-line bg-paper p-5">
          <p className="font-mono text-[11px] tracking-wider text-muted-foreground">
            APPLY
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {!session?.user ? (
              <>
                <Button asChild>
                  <Link href={`/signup?next=/jobs/${companySlug}/${jobSlug}`}>
                    Create an account to apply
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/login?next=/jobs/${companySlug}/${jobSlug}`}>
                    Sign in
                  </Link>
                </Button>
              </>
            ) : job.status !== "published" ? (
              <p className="text-sm text-muted-foreground">
                This listing is not public. Candidates cannot apply until it is
                published.
              </p>
            ) : profile?.accountType !== "candidate" ? (
              <p className="text-sm text-muted-foreground">
                Applications are for candidate accounts. Keep this seat for
                hiring, or create a candidate profile to apply.
              </p>
            ) : (
              <ApplyForm
                jobId={job.id}
                alreadyApplied={applied}
                resumeUrl={profile?.resumeUrl}
              />
            )}
            {session?.user && profile?.accountType === "candidate" ? (
              <SaveJobButton jobId={job.id} saved={saved} />
            ) : null}
            <Button variant="outline" asChild>
              <Link href={`/companies/${job.company.slug}`}>
                View company
              </Link>
            </Button>
          </div>
        </aside>
      </div>
      {related.length > 0 ? (
        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] tracking-wider text-muted-foreground">
                MORE LIKE THIS
              </p>
              <h2 className="mt-1 font-heading text-2xl">Related roles</h2>
            </div>
            <Link href="/jobs" className="text-sm text-primary hover:underline">
              Browse all jobs
            </Link>
          </div>
          <div className="grid gap-3">
            {related.map((item) => (
              <JobCard key={item.id} job={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

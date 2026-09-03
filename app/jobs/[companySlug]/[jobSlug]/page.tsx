import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplyForm, SaveJobButton } from "@/components/apply-form";
import { CompanyMark } from "@/components/company-mark";
import { PromotionRail } from "@/components/promotion-rail";
import { Button } from "@/components/ui/button";
import { getOptionalSession } from "@/lib/auth/server";
import {
  ensureProfile,
  getExistingApplication,
  getJobBySlugs,
  isJobSaved,
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
  if (!job) {
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
  const job = await getJobBySlugs(companySlug, jobSlug);
  if (!job) {
    notFound();
  }

  const session = await getOptionalSession();
  const profile = session?.user
    ? await ensureProfile({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      })
    : null;

  await recordJobView(job.id, session?.user?.id);

  const applied = session?.user
    ? Boolean(await getExistingApplication(job.id, session.user.id))
    : false;
  const saved = session?.user
    ? await isJobSaved(job.id, session.user.id)
    : false;
  const rail = railFor(job);
  const salary = formatSalary({
    min: job.salaryMin,
    max: job.salaryMax,
    currency: job.salaryCurrency,
    period: job.salaryPeriod,
    show: job.showSalary,
  });

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <article className="relative border border-line bg-paper">
        <PromotionRail rail={rail} />
        <div className="px-5 py-6 sm:px-8">
          <div className="flex items-start gap-3">
            <CompanyMark name={job.company.name} className="size-11 text-sm" />
            <div>
              <p className="text-sm text-muted-foreground">
                <Link href={`/companies/${job.company.slug}`} className="hover:text-ink">
                  {job.company.name}
                </Link>
              </p>
              <h1 className="mt-1 font-heading text-3xl sm:text-4xl">{job.title}</h1>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] tracking-wide text-muted-foreground">
            <span>{formatEmployment(job.employmentType)}</span>
            <span>{formatWorkplace(job.workplaceType)}</span>
            {job.location ? <span>{job.location}</span> : null}
            {salary ? <span>{salary}</span> : null}
            <span>{formatPostedAt(job.publishedAt)}</span>
          </div>
          <div className="prose-rolecall mt-8 space-y-6 text-sm leading-6">
            <section>
              <h2 className="font-heading text-xl">The role</h2>
              <p className="mt-2 whitespace-pre-wrap text-ink/90">{job.description}</p>
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
                <p className="mt-2 whitespace-pre-wrap text-ink/90">{job.requirements}</p>
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
          ) : profile?.accountType !== "candidate" ? (
            <p className="text-sm text-muted-foreground">
              Applications are for candidate accounts. Switch during onboarding
              or keep this as a hiring seat.
            </p>
          ) : (
            <ApplyForm jobId={job.id} alreadyApplied={applied} />
          )}
          {session?.user && profile?.accountType === "candidate" ? (
            <SaveJobButton jobId={job.id} saved={saved} />
          ) : null}
        </div>
      </aside>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { loadDashboardContext } from "@/lib/dashboard";
import { formatCents, formatStage } from "@/lib/format";
import { companyPlan } from "@/lib/plans";
import { countPublishedJobs, countSeats, listCandidateApplications, listSavedJobs } from "@/lib/queries";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { user, profile, company, access, memberships } = await loadDashboardContext();
  const isHiring = profile.accountType === "employer" || profile.isPlatformAdmin;

  if (!isHiring) {
    const [applications, saved] = await Promise.all([
      listCandidateApplications(user.id),
      listSavedJobs(user.id),
    ]);

    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
          CANDIDATE
          {profile.isPlatformAdmin ? " · PLATFORM ADMIN" : ""}
        </p>
        <h1 className="mt-2 font-heading text-4xl">
          Hello{profile.fullName ? `, ${profile.fullName.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Track applications and saved roles. Keep your profile current so
          hiring teams can read you quickly.
        </p>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <section className="border border-line p-4">
            <h2 className="font-mono text-[11px] tracking-wider text-muted-foreground">
              PROFILE
            </h2>
            <p className="mt-2 text-sm">{profile.headline ?? "No headline yet."}</p>
            <Button className="mt-4" size="sm" variant="outline" asChild>
              <Link href="/profile">Edit profile</Link>
            </Button>
          </section>
          <section className="border border-line p-4">
            <h2 className="font-mono text-[11px] tracking-wider text-muted-foreground">
              APPLICATIONS
            </h2>
            <p className="mt-2 font-heading text-2xl">{applications.length}</p>
            <p className="text-sm text-muted-foreground">on file</p>
          </section>
          <section className="border border-line p-4">
            <h2 className="font-mono text-[11px] tracking-wider text-muted-foreground">
              SAVED
            </h2>
            <p className="mt-2 font-heading text-2xl">{saved.length}</p>
            <p className="text-sm text-muted-foreground">roles</p>
          </section>
        </div>
        {applications.length > 0 ? (
          <section className="mt-8">
            <h2 className="font-heading text-2xl">Applications</h2>
            <ul className="mt-3 divide-y divide-line border border-line">
              {applications.map((row) => (
                <li key={row.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <Link
                    href={`/jobs/${row.company.slug}/${row.job.slug}`}
                    className="hover:underline"
                  >
                    {row.job.title}
                    <span className="text-muted-foreground"> · {row.company.name}</span>
                  </Link>
                  <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                    {formatStage(row.stage).toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {saved.length > 0 ? (
          <section className="mt-8">
            <h2 className="font-heading text-2xl">Saved jobs</h2>
            <ul className="mt-3 divide-y divide-line border border-line">
              {saved.map((job) => (
                <li key={job.id} className="px-4 py-3 text-sm">
                  <Link
                    href={`/jobs/${job.company.slug}/${job.slug}`}
                    className="hover:underline"
                  >
                    {job.title}
                    <span className="text-muted-foreground"> · {job.company.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    );
  }

  if (!company || !access) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
          EMPLOYER
        </p>
        <h1 className="mt-2 font-heading text-4xl">Create your company</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          You become the owner. Then you can post jobs, move applicants, and
          invite a teammate.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/dashboard/company">Set up company</Link>
        </Button>
      </div>
    );
  }

  const plan = companyPlan(company.subscriptionTier, company.overrideTier);
  const [published, seats] = await Promise.all([
    countPublishedJobs(company.id),
    countSeats(company.id),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
        EMPLOYER
        {profile.isPlatformAdmin ? " · PLATFORM ADMIN" : ""}
        {access.role ? ` · ${access.role.toUpperCase()}` : ""}
      </p>
      <h1 className="mt-2 font-heading text-4xl">{company.name}</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        {company.tagline ?? "Post jobs, run the pipeline, and invite your team."}
      </p>
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        <section className="border border-line p-4">
          <h2 className="font-mono text-[11px] tracking-wider text-muted-foreground">
            ACTIVE JOBS
          </h2>
          <p className="mt-2 font-heading text-2xl">
            {published}
            <span className="text-base text-muted-foreground">
              {" "}
              / {plan.activeJobs === "unlimited" ? "∞" : plan.activeJobs}
            </span>
          </p>
          <Button className="mt-4" size="sm" variant="outline" asChild>
            <Link href="/dashboard/jobs">Manage jobs</Link>
          </Button>
        </section>
        <section className="border border-line p-4">
          <h2 className="font-mono text-[11px] tracking-wider text-muted-foreground">
            SEATS
          </h2>
          <p className="mt-2 font-heading text-2xl">
            {seats}
            <span className="text-base text-muted-foreground">
              {" "}
              / {plan.seats === "unlimited" ? "∞" : plan.seats}
            </span>
          </p>
          <Button className="mt-4" size="sm" variant="outline" asChild>
            <Link href="/dashboard/team">Team</Link>
          </Button>
        </section>
        <section className="border border-line p-4">
          <h2 className="font-mono text-[11px] tracking-wider text-muted-foreground">
            PLAN
          </h2>
          <p className="mt-2 font-heading text-2xl">{plan.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatCents(company.adCreditBalanceCents)} in ad credits
          </p>
          <Button className="mt-4" size="sm" variant="outline" asChild>
            <Link href="/dashboard/billing">Billing</Link>
          </Button>
        </section>
      </div>
      {memberships.length > 1 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          You have {memberships.length} company seats. Use Switch in the bar
          above to move between them.
        </p>
      ) : null}
    </div>
  );
}

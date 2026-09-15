import Link from "next/link";
import { JobCard } from "@/components/job-card";
import { HomeHero } from "@/components/home-hero";
import { Button } from "@/components/ui/button";
import { listPublishedJobs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allJobs = await listPublishedJobs();
  const jobs = allJobs.slice(0, 6);

  return (
    <div>
      <HomeHero />

      <section className="border-t border-line bg-fog/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-3 md:gap-10">
          {[
            {
              step: "01",
              title: "Find the role",
              copy: "Search a live board ranked for clarity — featured and promoted jobs stay labeled.",
            },
            {
              step: "02",
              title: "Apply with context",
              copy: "Send a focused application. Employers see the right details without the noise.",
            },
            {
              step: "03",
              title: "Hire in the open",
              copy: "Companies post, manage applicants, and promote roles without hiding paid placement.",
            },
          ].map((item) => (
            <div key={item.step}>
              <p className="text-sm font-semibold tracking-[0.14em] text-primary">
                {item.step}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-ink">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium tracking-[0.08em] text-primary uppercase">
              Open roles
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
              {allJobs.length > 0
                ? `${allJobs.length} live on the board`
                : "Fresh roles land here"}
            </h2>
          </div>
          <Link
            href="/jobs"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View all jobs
          </Link>
        </div>
        <div className="grid gap-3">
          {jobs.length === 0 ? (
            <p className="rounded-2xl border border-line bg-white px-6 py-10 text-sm text-muted-foreground">
              No published roles yet. When employers post, they appear here.
            </p>
          ) : (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>
      </section>

      <section className="border-y border-line bg-ink text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              Paid placement, labeled in plain sight.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">
              Featured and promoted listings sit on a marked rail. The rest of
              the board is ranked openly — so candidates and employers can trust
              what they are looking at.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 px-5 py-5">
              <p className="text-lg font-semibold">For candidates</p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                See every open role with clear labels. Apply when the fit is
                right.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 px-5 py-5">
              <p className="text-lg font-semibold">For employers</p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Post roles, review applicants, and promote listings with
                placement that stays clearly labeled.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-3xl border border-line bg-white px-6 py-12 sm:px-10">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Ready when you are.
          </h2>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            Create an account to apply, or start hiring with a labeled listing
            on RoleCall.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="h-11 rounded-full bg-ink px-6 text-white hover:bg-ink/90"
            >
              <Link href="/signup">Create an account</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 rounded-full border-line px-6"
            >
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

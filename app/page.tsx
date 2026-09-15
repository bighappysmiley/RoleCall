import Image from "next/image";
import Link from "next/link";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { listPublishedJobs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allJobs = await listPublishedJobs();
  const jobs = allJobs.slice(0, 6);

  return (
    <div>
      <section className="relative isolate min-h-[min(92vh,52rem)] overflow-hidden">
        <Image
          src="/hero-workspace.jpg"
          alt="Colleagues collaborating around a laptop in a bright, welcoming workspace"
          fill
          priority
          className="hero-drift object-cover object-[center_35%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgb(18_32_51/0.72)_0%,rgb(18_53_58/0.48)_48%,rgb(13_115_119/0.28)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgb(212_146_10/0.18),transparent_42%)]" />

        <div className="relative mx-auto flex min-h-[min(92vh,52rem)] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:pb-20 sm:pt-32">
          <p className="reveal font-display text-[clamp(3.5rem,12vw,8.5rem)] leading-[0.88] font-bold tracking-[-0.06em] text-white">
            RoleCall
          </p>
          <h1 className="reveal reveal-delay-1 mt-5 max-w-2xl text-balance text-2xl font-medium tracking-[-0.03em] text-white/95 sm:text-3xl md:text-4xl">
            The hiring board that stays clear about who paid for the spotlight.
          </h1>
          <p className="reveal reveal-delay-2 mt-4 max-w-lg text-base text-white/75 sm:text-lg">
            Browse open roles, apply in minutes, or post a job with placement
            that is always labeled.
          </p>
          <div className="reveal reveal-delay-3 mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-xl px-6 text-base shadow-[0_8px_28px_rgb(13_115_119/0.35)]"
            >
              <Link href="/jobs">Browse jobs</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-xl border-white/40 bg-white/12 px-6 text-base text-white shadow-none backdrop-blur-md hover:bg-white/20 hover:text-white"
            >
              <Link href="/signup">Post a job</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-line/70">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgb(13_115_119/0.06),transparent_50%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-3 md:gap-5">
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
          ].map((item, index) => (
            <div
              key={item.step}
              className={`surface surface-hover p-6 ${index === 1 ? "md:-translate-y-1" : ""}`}
            >
              <p className="font-display text-sm font-semibold tracking-[0.2em] text-primary">
                {item.step}
              </p>
              <h2 className="mt-3 font-display text-2xl tracking-[-0.04em]">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Open roles</p>
            <h2 className="mt-2 font-display text-3xl tracking-[-0.04em] sm:text-4xl">
              {allJobs.length > 0
                ? `${allJobs.length} live on the board`
                : "Fresh roles land here"}
            </h2>
          </div>
          <Link
            href="/jobs"
            className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline"
          >
            View all jobs
          </Link>
        </div>
        <div className="grid gap-3">
          {jobs.length === 0 ? (
            <p className="surface px-6 py-10 text-sm text-muted-foreground">
              No published roles yet. When employers post, they appear here.
            </p>
          ) : (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-line/60 bg-navy text-white">
        <div className="pointer-events-none absolute -top-24 right-0 size-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 size-56 rounded-full bg-signal/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h2 className="font-display text-3xl tracking-[-0.04em] sm:text-4xl">
              Paid placement, labeled in plain sight.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">
              Featured and promoted listings sit on a marked rail. The rest of
              the board is ranked openly — so candidates and employers can trust
              what they are looking at.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/12 bg-white/8 px-5 py-5 backdrop-blur-sm">
              <p className="font-display text-lg">For candidates</p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                See every open role with clear labels. Apply when the fit is
                right.
              </p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/8 px-5 py-5 backdrop-blur-sm">
              <p className="font-display text-lg">For employers</p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Post roles, review applicants, and promote listings with
                placement that stays clearly labeled.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell">
        <div className="surface relative overflow-hidden px-6 py-12 sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -right-8 top-0 size-48 rounded-full bg-primary/10 blur-2xl float-soft" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 size-40 rounded-full bg-signal/10 blur-2xl" />
          <div className="relative max-w-xl">
            <h2 className="font-display text-3xl tracking-[-0.04em] sm:text-4xl">
              Ready when you are.
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Create an account to apply, or start hiring with a labeled listing
              on RoleCall.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-xl px-6 text-base"
              >
                <Link href="/signup">Create an account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-xl px-6 text-base"
              >
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

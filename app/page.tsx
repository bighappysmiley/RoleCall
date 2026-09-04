import Link from "next/link";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { listPublishedJobs } from "@/lib/queries";

export default async function HomePage() {
  const allJobs = await listPublishedJobs();
  const jobs = allJobs.slice(0, 6);

  return (
    <div>
      <section className="border-b border-line bg-paper">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:py-24 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
              BIGHAPPYSMILEY · ROLECALL
            </p>
            <h1 className="mt-4 max-w-3xl font-heading text-4xl leading-[1.05] font-semibold tracking-[-0.04em] sm:text-6xl">
              A hiring board that still reads like a directory.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Employers post jobs. Candidates apply. Featured and promoted
              listings sit on a labeled rail. Nobody has to guess who paid.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/jobs">Browse jobs</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/signup">Create an account</Link>
              </Button>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-3 border border-line bg-fog p-4 font-mono text-[11px] tracking-wide">
            <div>
              <dt className="text-muted-foreground">BOARD</dt>
              <dd className="mt-1 text-sm text-ink">{allJobs.length} open</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">PLANS</dt>
              <dd className="mt-1 text-sm text-ink">$0–$149</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">HOST</dt>
              <dd className="mt-1 text-sm text-ink">Vercel Hobby</dd>
            </div>
          </dl>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-heading text-2xl">Open roles</h2>
          <Link href="/jobs" className="font-mono text-[11px] tracking-wide text-primary">
            FULL BOARD
          </Link>
        </div>
        <div className="grid gap-3">
          {jobs.length === 0 ? (
            <p className="border border-line bg-fog px-4 py-6 text-sm text-muted-foreground">
              No published roles yet.
            </p>
          ) : (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>
      </section>
    </div>
  );
}

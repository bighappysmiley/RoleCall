import type { Metadata } from "next";
import { JobCard } from "@/components/job-card";
import { listPublishedJobs } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Jobs",
};

export default async function JobsPage() {
  const jobs = await listPublishedJobs();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
            LIVE BOARD
          </p>
          <h1 className="mt-2 font-heading text-4xl">Jobs</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Featured sits at the top, then credit-promoted, then the rest.
            Search and filters come in the next build.
          </p>
        </div>
        <p className="font-mono text-[11px] tracking-wide text-muted-foreground">
          {jobs.length} OPEN
        </p>
      </div>
      <div className="grid gap-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}

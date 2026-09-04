import type { Metadata } from "next";
import { JobCard } from "@/components/job-card";
import { JobsFilter } from "@/components/jobs-filter";
import { jobBoardFilterSchema } from "@/lib/auth/schemas";
import { listPublishedJobs } from "@/lib/queries";
import type { JobBoardFilters } from "@/lib/types";

export const metadata: Metadata = {
  title: "Jobs",
};

function firstParam(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed || undefined;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const parsed = jobBoardFilterSchema.safeParse({
    q: firstParam(params.q),
    type: firstParam(params.type),
    workplace: firstParam(params.workplace),
    location: firstParam(params.location),
  });
  const filters: JobBoardFilters = parsed.success ? parsed.data : {};
  const jobs = await listPublishedJobs(filters);

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
            Search and filters rank the board — they do not hide paid labels.
          </p>
        </div>
        <p className="font-mono text-[11px] tracking-wide text-muted-foreground">
          {jobs.length} OPEN
        </p>
      </div>
      <div className="mb-6">
        <JobsFilter filters={filters} />
      </div>
      {jobs.length === 0 ? (
        <p className="border border-line bg-fog px-4 py-6 text-sm text-muted-foreground">
          {filters.q || filters.type || filters.workplace || filters.location
            ? "No published roles match those filters."
            : "No published roles yet."}
        </p>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}

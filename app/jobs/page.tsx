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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-[0.08em] text-primary uppercase">
            Live board
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-[-0.04em] sm:text-5xl">
            Jobs
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Featured and promoted roles stay labeled. Search ranks the board —
            it never hides who paid for placement.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {jobs.length} open {jobs.length === 1 ? "role" : "roles"}
        </p>
      </div>
      <div className="mb-6">
        <JobsFilter filters={filters} />
      </div>
      {jobs.length === 0 ? (
        <p className="border border-line bg-white/80 px-5 py-8 text-sm text-muted-foreground">
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

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center px-4 py-16 text-center">
      <p className="font-mono-data text-xs text-[var(--muted)]">404</p>
      <h1 className="mt-2 font-display text-3xl font-medium">Page not found</h1>
      <p className="mt-2 text-[var(--muted)]">
        That route doesn&apos;t exist. Try the job board.
      </p>
      <Link
        href="/jobs"
        className="mt-6 inline-flex justify-center bg-[var(--primary)] px-4 py-2 text-sm text-white"
      >
        Browse jobs
      </Link>
    </div>
  );
}

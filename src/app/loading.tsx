export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-[var(--fog)]" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-64 animate-pulse rounded-2xl bg-[var(--fog)]" />
        <div className="h-64 animate-pulse rounded-2xl bg-[var(--fog)]" />
        <div className="h-64 animate-pulse rounded-2xl bg-[var(--fog)]" />
      </div>
    </div>
  );
}

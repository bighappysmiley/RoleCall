export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="h-8 w-48 animate-pulse bg-[var(--fog)]" />
      <div className="mt-6 space-y-3">
        <div className="h-24 animate-pulse bg-[var(--fog)]" />
        <div className="h-24 animate-pulse bg-[var(--fog)]" />
        <div className="h-24 animate-pulse bg-[var(--fog)]" />
      </div>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24">
      <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
        404
      </p>
      <h1 className="mt-2 font-heading text-4xl">That page is not on the board.</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Try the job list, or go home.
      </p>
      <Link href="/jobs" className="mt-6 inline-block text-sm text-primary hover:underline">
        Browse jobs
      </Link>
    </div>
  );
}

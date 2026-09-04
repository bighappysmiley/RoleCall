"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-medium">Something went wrong</h1>
      <p className="mt-3 text-[var(--muted)]">
        We couldn&apos;t load this page. Try again, or head back to the job
        board.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Link href="/jobs">
          <Button variant="secondary">Browse jobs</Button>
        </Link>
      </div>
    </div>
  );
}

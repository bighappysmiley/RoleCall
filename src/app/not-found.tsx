import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-[var(--muted)]">
        That page doesn&apos;t exist. Try the job board instead.
      </p>
      <Link href="/jobs" className="mt-6 inline-flex justify-center">
        <Button>Browse jobs</Button>
      </Link>
    </div>
  );
}

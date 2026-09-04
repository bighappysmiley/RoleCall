import Link from "next/link";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`font-display text-xl font-medium tracking-tight text-[var(--ink)] ${className}`}
    >
      RoleCall
    </Link>
  );
}

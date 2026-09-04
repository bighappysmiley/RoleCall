import Link from "next/link";

/** Black Ops–style geometric R path, viewBox 0 0 128 128 */
const R_PATH =
  "M28.46-14.43L22.80-14.43L22.80-23.74L34.84-23.74L34.84-38.50L22.80-38.50L22.80-48.10L41.11-48.10L50.75-38.50L50.75-24.07L43.28-16.60L52.38 0L35.27 0L28.46-14.43M20.26 0L4.24 0L4.24-48.10L20.26-48.10";

const R_TRANSFORM = "translate(35.69 88.05)";

export function RoleCallMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 128 128"
      width="28"
      height="28"
      aria-hidden
    >
      <rect width="128" height="128" rx="14" fill="#1d4ed8" />
      <path transform={R_TRANSFORM} d={R_PATH} fill="#fff" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 text-[var(--ink)] ${className}`}
    >
      <RoleCallMark />
      <span className="font-display text-[22px] font-semibold tracking-tight">
        RoleCall
      </span>
    </Link>
  );
}

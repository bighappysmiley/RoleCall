import Link from "next/link";
import { cn } from "@/lib/utils";

/** Geometric R mark from the RoleCall brand on main. */
const R_PATH =
  "M38.27-19.40L30.66-19.40L30.66-31.93L46.85-31.93L46.85-51.77L30.66-51.77L30.66-64.69L55.28-64.69L68.25-51.77L68.25-32.37L58.21-22.33L70.44 0L47.43 0L38.27-19.40M27.25 0L5.70 0L5.70-64.69L27.25-64.69";

const R_TRANSFORM = "translate(25.93 96.35)";

export function RoleCallMark({ className }: { className?: string }) {
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

export function Wordmark({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 text-ink",
        className,
      )}
    >
      <RoleCallMark />
      <span className="font-heading text-[1.05rem] font-semibold tracking-[-0.04em]">
        RoleCall
      </span>
    </Link>
  );
}

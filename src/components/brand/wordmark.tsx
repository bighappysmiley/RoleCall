import Link from "next/link";

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
      <g
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M 78 34 C 98 42 110 58 110 76 C 110 94 98 110 78 118"
          strokeWidth="8"
        />
        <path
          d="M 70 44 C 84 50 93 61 93 76 C 93 91 84 102 70 108"
          strokeWidth="8"
        />
        <path
          d="M 62 54 C 70 58 76 66 76 76 C 76 86 70 94 62 98"
          strokeWidth="8"
        />
      </g>
      <circle cx="42" cy="48" r="12" fill="#fff" />
      <path
        d="M 20 92 C 20 74 30 66 42 66 C 54 66 64 74 64 92 Z"
        fill="#fff"
      />
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

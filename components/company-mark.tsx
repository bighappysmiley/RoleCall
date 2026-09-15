import Image from "next/image";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CompanyMark({
  name,
  logoUrl,
  className,
}: {
  name: string;
  logoUrl?: string | null;
  className?: string;
}) {
  if (logoUrl) {
    return (
      <span
        className={cn(
          "relative inline-flex size-9 shrink-0 overflow-hidden rounded-xl border border-line/80 bg-white shadow-sm",
          className,
        )}
      >
        <Image
          src={logoUrl}
          alt=""
          fill
          className="object-contain p-1"
          sizes="64px"
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-line/80 bg-mist/60 font-mono text-[11px] tracking-wide text-navy",
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

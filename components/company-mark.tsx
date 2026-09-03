import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CompanyMark({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center border border-line bg-fog font-mono text-[11px] tracking-wide text-ink",
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

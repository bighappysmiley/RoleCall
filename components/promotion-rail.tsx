import { cn } from "@/lib/utils";
import type { RailKind } from "@/lib/types";

export function PromotionRail({
  rail,
  className,
}: {
  rail: RailKind;
  className?: string;
}) {
  if (rail === "none") {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-[3px]",
          rail === "featured" && "bg-signal",
          rail === "promoted" &&
            "bg-[repeating-linear-gradient(to_bottom,#C9851A_0_6px,transparent_6px_10px)]",
          rail === "pro" && "bg-signal/70",
        )}
      />
      {rail === "featured" ? (
        <span className="absolute top-0 right-0 bg-signal px-2 py-0.5 text-[10px] font-medium tracking-wide text-ink">
          Featured
        </span>
      ) : null}
      {rail === "promoted" ? (
        <span className="absolute top-2 right-2 text-[10px] font-medium tracking-wide text-signal">
          Promoted
        </span>
      ) : null}
    </div>
  );
}

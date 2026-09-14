import { cn } from "@/lib/utils";
import type { BadgeRecord } from "@/lib/types";

export function BadgeIcon({
  badge,
  className,
  size = 20,
}: {
  badge: Pick<BadgeRecord, "name" | "iconDataUrl">;
  className?: string;
  size?: number;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={badge.iconDataUrl}
      alt=""
      width={size}
      height={size}
      title={badge.name}
      className={cn("inline-block shrink-0 object-contain", className)}
      style={{ width: size, height: size, background: "transparent" }}
    />
  );
}

export function NameWithBadge({
  name,
  badge,
  className,
  badgeSize = 20,
}: {
  name: string;
  badge?: Pick<BadgeRecord, "name" | "iconDataUrl"> | null;
  className?: string;
  badgeSize?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span>{name}</span>
      {badge ? <BadgeIcon badge={badge} size={badgeSize} /> : null}
    </span>
  );
}

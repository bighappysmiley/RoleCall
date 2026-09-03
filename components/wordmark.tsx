import Link from "next/link";
import { cn } from "@/lib/utils";

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
        "font-heading text-[1.05rem] font-semibold tracking-[-0.04em] text-ink",
        className,
      )}
    >
      RoleCall
    </Link>
  );
}

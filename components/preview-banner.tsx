import { isPreviewSite } from "@/lib/site-url";

export function PreviewBanner() {
  if (!isPreviewSite()) {
    return null;
  }

  return (
    <div className="border-b border-line bg-signal px-4 py-2 text-center font-mono text-[11px] tracking-wide text-ink">
      Preview site — this is not the live RoleCall board. Changes land here
      first. The public site updates only after you publish to{" "}
      <span className="font-semibold">main</span>.
    </div>
  );
}

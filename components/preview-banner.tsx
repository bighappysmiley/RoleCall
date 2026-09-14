import { isPreviewSite } from "@/lib/site-url";

export function PreviewBanner() {
  if (!isPreviewSite()) {
    return null;
  }

  return (
    <div className="border-b border-line bg-signal px-4 py-2 text-center text-sm text-ink">
      You are on a preview version of RoleCall. The public board is unchanged.
    </div>
  );
}

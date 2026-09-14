import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminCategory } from "@/components/admin-category";
import { BadgeAdminList, CreateBadgeForm } from "@/components/admin-badges";
import { listBadges } from "@/lib/badge-queries";
import { requireOnboardedUser } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { profile } = await requireOnboardedUser();
  if (!profile.isPlatformAdmin) {
    redirect("/dashboard");
  }

  const badges = await listBadges();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
        PLATFORM
      </p>
      <h1 className="mt-2 font-heading text-4xl">Admin panel</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Manage platform settings. Expand a category to work inside it.
      </p>

      <div className="mt-8 space-y-3">
        <AdminCategory title="Overview" defaultOpen>
          <p className="text-sm text-muted-foreground">
            You are signed in as a platform admin. Use Badges to create icons
            that teams and people can pin next to their names.
          </p>
        </AdminCategory>

        <AdminCategory title="Badges" defaultOpen>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <CreateBadgeForm />
            <div>
              <h3 className="mb-3 font-heading text-xl">Library</h3>
              {badges.length === 0 ? (
                <p className="border border-line px-4 py-6 text-sm text-muted-foreground">
                  No badges yet. Create one with a transparent icon.
                </p>
              ) : (
                <BadgeAdminList badges={badges} />
              )}
            </div>
          </div>
        </AdminCategory>
      </div>
    </div>
  );
}

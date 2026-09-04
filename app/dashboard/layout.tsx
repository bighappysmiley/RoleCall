import { DashboardNav } from "@/components/dashboard-nav";
import { loadDashboardContext } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await loadDashboardContext();
  const showHiringNav =
    ctx.profile.accountType === "employer" || ctx.profile.isPlatformAdmin;

  return (
    <div>
      <DashboardNav
        companies={ctx.memberships.map((row) => ({
          id: row.company.id,
          name: row.company.name,
        }))}
        activeId={ctx.company?.id}
        showHiringNav={showHiringNav}
      />
      {children}
    </div>
  );
}

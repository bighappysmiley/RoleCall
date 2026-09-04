import Link from "next/link";
import { switchCompanyAction } from "@/lib/actions/companies";
import { Button } from "@/components/ui/button";
import type { CompanyRecord } from "@/lib/types";

const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/company", label: "Company" },
  { href: "/dashboard/jobs", label: "Jobs" },
  { href: "/dashboard/team", label: "Team" },
  { href: "/dashboard/billing", label: "Billing" },
];

export function DashboardNav({
  companies,
  activeId,
  showHiringNav,
}: {
  companies: { id: string; name: string }[];
  activeId?: string;
  showHiringNav: boolean;
}) {
  return (
    <div className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <nav className="flex flex-wrap gap-4 text-sm">
          <Link href="/dashboard" className="hover:text-ink">
            Overview
          </Link>
          {showHiringNav
            ? LINKS.filter((item) => item.href !== "/dashboard").map((item) => (
                <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-ink">
                  {item.label}
                </Link>
              ))
            : null}
          <Link href="/profile" className="text-muted-foreground hover:text-ink">
            Profile
          </Link>
        </nav>
        {companies.length > 1 ? (
          <form action={switchCompanyAction}>
            <select
              name="companyId"
              defaultValue={activeId}
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm" variant="outline" className="ml-2">
              Switch
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

export type DashboardCompanyOption = Pick<CompanyRecord, "id" | "name">;
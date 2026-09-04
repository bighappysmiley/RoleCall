import type { Metadata } from "next";
import Link from "next/link";
import { CompanyForm } from "@/components/company-form";
import { DeleteCompanyForm } from "@/components/delete-forms";
import { Button } from "@/components/ui/button";
import { requireEmployerCompany } from "@/lib/dashboard";
import { canDeleteCompany, canEditCompany } from "@/lib/permissions";

export const metadata: Metadata = { title: "Company" };
export const dynamic = "force-dynamic";

export default async function DashboardCompanyPage() {
  const { company, access } = await requireEmployerCompany();

  if (!company || !access) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
          COMPANY
        </p>
        <h1 className="mt-2 font-heading text-4xl">New company</h1>
        <p className="mt-2 mb-8 max-w-xl text-sm text-muted-foreground">
          You will be the owner. The public company page goes live as soon as
          you save.
        </p>
        <CompanyForm />
      </div>
    );
  }

  const editable = canEditCompany(access);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
        COMPANY
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl">{company.name}</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            This is the public profile people see on{" "}
            <Link href={`/companies/${company.slug}`} className="text-primary hover:underline">
              /companies/{company.slug}
            </Link>
            .
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/companies/${company.slug}`}>View public page</Link>
        </Button>
      </div>
      <div className="mt-8">
        <CompanyForm company={company} readOnly={!editable} />
      </div>
      {canDeleteCompany(access) ? (
        <DeleteCompanyForm companyId={company.id} companyName={company.name} />
      ) : null}
    </div>
  );
}

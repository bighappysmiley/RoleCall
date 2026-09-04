import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CopyLink } from "@/components/copy-link";
import { InviteForm, RemoveMemberButton } from "@/components/team-forms";
import { requireEmployerCompany } from "@/lib/dashboard";
import { formatRole } from "@/lib/format";
import { canManageTeam } from "@/lib/permissions";
import { companyPlan } from "@/lib/plans";
import { countSeats, listCompanyMembers } from "@/lib/queries";

export const metadata: Metadata = { title: "Team" };
export const dynamic = "force-dynamic";

function inviteUrl(token: string): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${site.replace(/\/$/, "")}/invite/${token}`;
}

export default async function TeamPage() {
  const { company, access } = await requireEmployerCompany();
  if (!company || !access) {
    redirect("/dashboard/company");
  }

  const [members, seats] = await Promise.all([
    listCompanyMembers(company.id),
    countSeats(company.id),
  ]);
  const plan = companyPlan(company.subscriptionTier, company.overrideTier);
  const canInvite = canManageTeam(access);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
        TEAM
      </p>
      <h1 className="mt-2 font-heading text-4xl">Seats</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        {seats} of {plan.seats === "unlimited" ? "unlimited" : plan.seats} seats
        on {plan.name}. Active people and pending invites both count. There is
        no email send yet — copy the link.
      </p>
      <div className="mt-8">
        <InviteForm companyId={company.id} canInvite={canInvite} />
      </div>
      <ul className="mt-8 divide-y divide-line border border-line">
        {members.map((row) => (
          <li key={row.id} className="flex flex-wrap items-start justify-between gap-4 px-4 py-4">
            <div>
              <p className="font-heading text-lg">
                {row.profile?.fullName ?? row.invitedEmail ?? "Seat"}
              </p>
              <p className="font-mono text-[11px] tracking-wider text-muted-foreground">
                {formatRole(row.role).toUpperCase()} · {row.status.toUpperCase()}
                {row.invitedEmail ? ` · ${row.invitedEmail}` : ""}
              </p>
              {row.status === "invited" && row.inviteToken ? (
                <div className="mt-3">
                  <CopyLink value={inviteUrl(row.inviteToken)} />
                </div>
              ) : null}
            </div>
            {canInvite && row.role !== "owner" ? (
              <RemoveMemberButton companyId={company.id} memberId={row.id} />
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

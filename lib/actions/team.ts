"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { inviteSchema } from "@/lib/auth/schemas";
import type { ActionState } from "@/lib/auth/state";
import {
  COMPANY_COOKIE,
  requireCompanyAccess,
  requireUser,
} from "@/lib/dashboard";
import { errorMessage } from "@/lib/errors";
import { formString } from "@/lib/form";
import { assertSeatLimit, companyPlan } from "@/lib/plans";
import { canManageTeam } from "@/lib/permissions";
import {
  acceptInvite,
  countSeats,
  ensureProfile,
  getInviteByToken,
  inviteCompanyMember,
  removeCompanyMember,
} from "@/lib/queries";

function inviteUrl(token: string): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${site.replace(/\/$/, "")}/invite/${token}`;
}

export async function inviteMemberAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = inviteSchema.safeParse({
    companyId: formString(formData, "companyId"),
    email: formString(formData, "email"),
    role: formString(formData, "role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the invite and try again." };
  }

  const { access, company } = await requireCompanyAccess(parsed.data.companyId);
  if (!canManageTeam(access)) {
    return { error: "You can view the team, but you cannot invite people." };
  }

  try {
    const plan = companyPlan(company.subscriptionTier, company.overrideTier);
    const seats = await countSeats(company.id);
    assertSeatLimit(plan, seats);
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 86_400_000);
    await inviteCompanyMember({
      companyId: company.id,
      email: parsed.data.email,
      role: parsed.data.role,
      token,
      expiresAt,
    });
    revalidatePath("/dashboard/team");
    return {
      success: "Invite created. Copy the link and send it yourself — email delivery comes later.",
      inviteUrl: inviteUrl(token),
    };
  } catch (error) {
    return { error: errorMessage(error, "Could not create the invite.") };
  }
}

export async function removeMemberAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const companyId = formString(formData, "companyId");
  const memberId = formString(formData, "memberId");
  const { access } = await requireCompanyAccess(companyId);
  if (!canManageTeam(access)) {
    return { error: "You cannot remove people from this team." };
  }
  try {
    await removeCompanyMember(memberId, companyId);
  } catch (error) {
    return { error: errorMessage(error, "Could not remove that seat.") };
  }
  revalidatePath("/dashboard/team");
  return { success: "Seat removed." };
}

export async function acceptInviteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = formString(formData, "token");
  const { user } = await requireUser(`/invite/${token}`);
  if (!user.email) {
    return { error: "This account has no email, so the invite cannot be matched." };
  }
  await ensureProfile({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
  });
  try {
    const invite = await getInviteByToken(token);
    if (!invite) {
      return { error: "This invite is not valid." };
    }
    const result = await acceptInvite({
      token,
      userId: user.id,
      email: user.email,
    });
    const store = await cookies();
    store.set(COMPANY_COOKIE, result.company.id, { path: "/", sameSite: "lax" });
  } catch (error) {
    return { error: errorMessage(error, "Could not accept the invite.") };
  }
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/auth/server";
import {
  canViewCompany,
  type CompanyAccess,
} from "@/lib/permissions";
import { requireUuid } from "@/lib/form";
import {
  ensureProfile,
  getActiveMembership,
  getCompanyById,
  listCompanies,
  listMemberships,
} from "@/lib/queries";
import type { CompanyRecord, ProfileRecord } from "@/lib/types";

const COMPANY_COOKIE = "rolecall-company-id";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export async function requireUser(nextPath?: string): Promise<{
  user: SessionUser;
  profile: ProfileRecord;
}> {
  const session = await getOptionalSession();
  if (!session?.user) {
    redirect(nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login");
  }
  const profile = await ensureProfile({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  });
  if (!profile) {
    redirect("/login");
  }
  return { user: session.user, profile };
}

export async function requireOnboardedUser() {
  const result = await requireUser();
  if (!result.profile.accountType) {
    redirect("/onboarding");
  }
  return result;
}

export async function loadDashboardContext() {
  const { user, profile } = await requireOnboardedUser();
  const memberships = await listMemberships(user.id);
  const cookieStore = await cookies();
  const cookieId = cookieStore.get(COMPANY_COOKIE)?.value;

  let company: CompanyRecord | null = null;
  let access: CompanyAccess | null = null;

  const fromMembership =
    memberships.find((row) => row.company.id === cookieId) ?? memberships[0];

  if (fromMembership) {
    company = await getCompanyById(fromMembership.company.id);
    if (company) {
      access = {
        companyId: company.id,
        isPlatformAdmin: profile.isPlatformAdmin,
        role: fromMembership.role,
      };
    }
  } else if (profile.isPlatformAdmin) {
    const all = await listCompanies();
    company = all.find((item) => item.id === cookieId) ?? all[0] ?? null;
    if (company) {
      access = {
        companyId: company.id,
        isPlatformAdmin: true,
        role: null,
      };
    }
  }

  return {
    user,
    profile,
    memberships,
    company,
    access,
    companies: memberships.map((row) => row.company),
  };
}

export async function requireCompanyAccess(companyId: string) {
  let id: string;
  try {
    id = requireUuid(companyId, "company");
  } catch {
    redirect("/dashboard");
  }
  const { user, profile } = await requireOnboardedUser();
  const membership = await getActiveMembership(user.id, id);
  const access: CompanyAccess = {
    companyId: id,
    isPlatformAdmin: profile.isPlatformAdmin,
    role: membership?.role ?? null,
  };
  if (!canViewCompany(access)) {
    redirect("/dashboard");
  }
  const company = await getCompanyById(id);
  if (!company) {
    redirect("/dashboard");
  }
  return { user, profile, membership, access, company };
}

export async function requireEmployerCompany() {
  const ctx = await loadDashboardContext();
  if (ctx.profile.accountType === "candidate" && !ctx.profile.isPlatformAdmin) {
    redirect("/dashboard");
  }
  return ctx;
}

export { COMPANY_COOKIE };

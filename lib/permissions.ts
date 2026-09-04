import type { MemberRole } from "@/lib/types";

export type CompanyPermission =
  | "company.read"
  | "company.write"
  | "company.delete"
  | "jobs.read"
  | "jobs.write"
  | "applications.read"
  | "applications.write"
  | "team.read"
  | "team.write";

export type AccessRole = MemberRole | "platform_admin";

export type CompanyAccess = {
  companyId: string;
  isPlatformAdmin: boolean;
  role: MemberRole | null;
};

const ROLE_PERMISSIONS: Record<MemberRole, readonly CompanyPermission[]> = {
  viewer: ["company.read", "jobs.read", "applications.read", "team.read"],
  recruiter: [
    "company.read",
    "jobs.read",
    "jobs.write",
    "applications.read",
    "applications.write",
    "team.read",
  ],
  admin: [
    "company.read",
    "company.write",
    "jobs.read",
    "jobs.write",
    "applications.read",
    "applications.write",
    "team.read",
    "team.write",
  ],
  owner: [
    "company.read",
    "company.write",
    "company.delete",
    "jobs.read",
    "jobs.write",
    "applications.read",
    "applications.write",
    "team.read",
    "team.write",
  ],
};

export function hasPermission(
  role: AccessRole,
  permission: CompanyPermission,
): boolean {
  if (role === "platform_admin") {
    return true;
  }
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canViewCompany(access: CompanyAccess): boolean {
  return access.isPlatformAdmin || access.role !== null;
}

export function can(
  access: CompanyAccess,
  permission: CompanyPermission,
): boolean {
  if (access.isPlatformAdmin) {
    return true;
  }
  if (!access.role) {
    return false;
  }
  return hasPermission(access.role, permission);
}

export function canEditCompany(access: CompanyAccess): boolean {
  return can(access, "company.write");
}

export function canManageBilling(access: CompanyAccess): boolean {
  return canEditCompany(access);
}

export function canDeleteCompany(access: CompanyAccess): boolean {
  return can(access, "company.delete");
}

export function canManageJobs(access: CompanyAccess): boolean {
  return can(access, "jobs.write");
}

export function canManageApplications(access: CompanyAccess): boolean {
  return can(access, "applications.write");
}

export function canManageTeam(access: CompanyAccess): boolean {
  return can(access, "team.write");
}

export function inviteableRoles(): Exclude<MemberRole, "owner">[] {
  return ["admin", "recruiter", "viewer"];
}

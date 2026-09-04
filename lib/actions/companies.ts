"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { companySchema } from "@/lib/auth/schemas";
import type { ActionState } from "@/lib/auth/state";
import { COMPANY_COOKIE, requireCompanyAccess, requireOnboardedUser } from "@/lib/dashboard";
import { errorMessage } from "@/lib/errors";
import {
  formString,
  parseOptionalYear,
  splitList,
} from "@/lib/form";
import { canDeleteCompany, canEditCompany } from "@/lib/permissions";
import { createCompany, deleteCompany, updateCompany } from "@/lib/queries";

function companyInputFromForm(formData: FormData) {
  const parsed = companySchema.safeParse({
    name: formString(formData, "name"),
    tagline: formString(formData, "tagline"),
    description: formString(formData, "description"),
    website: formString(formData, "website"),
    industry: formString(formData, "industry"),
    sizeRange: formString(formData, "sizeRange"),
    foundedYear: formString(formData, "foundedYear"),
    locations: formString(formData, "locations"),
    techStack: formString(formData, "techStack"),
    benefits: formString(formData, "benefits"),
    linkedin: formString(formData, "linkedin"),
    twitter: formString(formData, "twitter"),
    github: formString(formData, "github"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Check the form and try again.");
  }
  return {
    name: parsed.data.name,
    tagline: parsed.data.tagline || null,
    description: parsed.data.description || null,
    website: parsed.data.website || null,
    industry: parsed.data.industry || null,
    sizeRange: parsed.data.sizeRange || null,
    foundedYear: parseOptionalYear(parsed.data.foundedYear ?? ""),
    locations: splitList(parsed.data.locations ?? ""),
    techStack: splitList(parsed.data.techStack ?? ""),
    benefits: splitList(parsed.data.benefits ?? ""),
    socialLinks: {
      linkedin: parsed.data.linkedin || undefined,
      twitter: parsed.data.twitter || undefined,
      github: parsed.data.github || undefined,
    },
  };
}

export async function createCompanyAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user, profile } = await requireOnboardedUser();
  if (profile.accountType !== "employer" && !profile.isPlatformAdmin) {
    return { error: "Switch to a hiring account to create a company." };
  }
  try {
    const company = await createCompany(user.id, companyInputFromForm(formData));
    const store = await cookies();
    store.set(COMPANY_COOKIE, company.id, { path: "/", sameSite: "lax" });
  } catch (error) {
    return { error: errorMessage(error, "Could not create the company.") };
  }
  revalidatePath("/dashboard");
  revalidatePath("/companies");
  redirect("/dashboard/company");
}

export async function updateCompanyAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const companyId = formString(formData, "companyId");
  const { access } = await requireCompanyAccess(companyId);
  if (!canEditCompany(access)) {
    return { error: "You can view this company, but you cannot edit it." };
  }
  try {
    await updateCompany(companyId, companyInputFromForm(formData));
  } catch (error) {
    return { error: errorMessage(error, "Could not save the company.") };
  }
  revalidatePath("/dashboard/company");
  revalidatePath("/companies");
  return { success: "Company saved." };
}

export async function deleteCompanyAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const companyId = formString(formData, "companyId");
  const confirm = formString(formData, "confirm");
  const { access, company } = await requireCompanyAccess(companyId);
  if (!canDeleteCompany(access)) {
    return { error: "Only the owner can delete this company." };
  }
  if (confirm.trim() !== company.name) {
    return { error: "Type the company name to confirm deletion." };
  }
  try {
    await deleteCompany(companyId);
  } catch (error) {
    return { error: errorMessage(error, "Could not delete the company.") };
  }
  const store = await cookies();
  store.delete(COMPANY_COOKIE);
  revalidatePath("/dashboard");
  revalidatePath("/companies");
  redirect("/dashboard");
}

export async function switchCompanyAction(formData: FormData) {
  await requireOnboardedUser();
  const companyId = formString(formData, "companyId");
  const store = await cookies();
  store.set(COMPANY_COOKIE, companyId, { path: "/", sameSite: "lax" });
  redirect("/dashboard");
}

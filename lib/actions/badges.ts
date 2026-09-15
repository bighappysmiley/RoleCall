"use server";

import { revalidatePath } from "next/cache";
import {
  awardCompanyBadge,
  awardProfileBadge,
  createBadge,
  deleteBadge,
  pinCompanyBadge,
  pinProfileBadge,
  revokeCompanyBadge,
  revokeProfileBadge,
  updateBadge,
} from "@/lib/badge-queries";
import type { ActionState } from "@/lib/auth/state";
import {
  requireCompanyAccess,
  requireOnboardedUser,
} from "@/lib/dashboard";
import { errorMessage } from "@/lib/errors";
import { formString } from "@/lib/form";
import { canEditCompany } from "@/lib/permissions";
import {
  getProfile,
  updateCompany,
  updateProfile,
  type CompanyWriteInput,
} from "@/lib/queries";

const MAX_ICON_CHARS = 180_000;

function readIconDataUrl(formData: FormData, required: boolean) {
  const raw = formString(formData, "iconDataUrl");
  if (!raw) {
    if (required) {
      throw new Error("Upload a badge icon.");
    }
    return null;
  }
  if (!raw.startsWith("data:image/")) {
    throw new Error("Badge icons must be image files (PNG, SVG, WebP, or GIF).");
  }
  if (raw.length > MAX_ICON_CHARS) {
    throw new Error("Keep badge icons under about 130KB.");
  }
  return raw;
}

async function requirePlatformAdmin() {
  const { user, profile } = await requireOnboardedUser();
  if (!profile.isPlatformAdmin) {
    throw new Error("Platform admin access required.");
  }
  return { user, profile };
}

export async function createBadgeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePlatformAdmin();
    const name = formString(formData, "name");
    if (!name) {
      return { error: "Name is required." };
    }
    await createBadge({
      name,
      description: formString(formData, "description") || null,
      iconDataUrl: readIconDataUrl(formData, true)!,
    });
    revalidatePath("/dashboard/admin");
    return { success: "Badge created." };
  } catch (error) {
    return { error: errorMessage(error, "Could not create badge.") };
  }
}

export async function updateBadgeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePlatformAdmin();
    const id = formString(formData, "badgeId");
    const name = formString(formData, "name");
    if (!id || !name) {
      return { error: "Badge and name are required." };
    }
    const iconDataUrl = readIconDataUrl(formData, false);
    await updateBadge(id, {
      name,
      description: formString(formData, "description") || null,
      ...(iconDataUrl ? { iconDataUrl } : {}),
    });
    revalidatePath("/dashboard/admin");
    return { success: "Badge updated." };
  } catch (error) {
    return { error: errorMessage(error, "Could not update badge.") };
  }
}

export async function deleteBadgeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePlatformAdmin();
    const id = formString(formData, "badgeId");
    if (!id) {
      return { error: "Badge is required." };
    }
    await deleteBadge(id);
    revalidatePath("/dashboard/admin");
    revalidatePath("/companies");
    return { success: "Badge deleted." };
  } catch (error) {
    return { error: errorMessage(error, "Could not delete badge.") };
  }
}

export async function awardProfileBadgeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { profile } = await requireOnboardedUser();
    const profileId = formString(formData, "profileId");
    const badgeId = formString(formData, "badgeId");
    if (!profileId || !badgeId) {
      return { error: "Choose a badge." };
    }
    if (profileId !== profile.id && !profile.isPlatformAdmin) {
      return { error: "You can only add badges to your own profile." };
    }
    await awardProfileBadge({
      profileId,
      badgeId,
      awardedBy: profile.id,
    });
    const { getBadge } = await import("@/lib/badge-queries");
    const badge = await getBadge(badgeId);
    if (badge) {
      const { notifyBadgeAwarded } = await import("@/lib/messaging");
      await notifyBadgeAwarded({
        userId: profileId,
        badgeName: badge.name,
        awardedByUserId: profile.id,
      });
    }
    revalidatePath(`/people/${profileId}`);
    revalidatePath("/dashboard/admin");
    revalidatePath("/notifications");
    return { success: "Badge added to profile." };
  } catch (error) {
    return { error: errorMessage(error, "Could not add badge.") };
  }
}

export async function awardCompanyBadgeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { profile } = await requireOnboardedUser();
    const companyId = formString(formData, "companyId");
    const badgeId = formString(formData, "badgeId");
    if (!companyId || !badgeId) {
      return { error: "Choose a badge." };
    }
    const { access, company } = await requireCompanyAccess(companyId);
    if (!canEditCompany(access)) {
      return { error: "You need edit access to add a company badge." };
    }
    await awardCompanyBadge({
      companyId,
      badgeId,
      awardedBy: profile.id,
    });
    revalidatePath(`/companies/${company.slug}`);
    revalidatePath("/companies");
    revalidatePath("/jobs");
    revalidatePath("/");
    revalidatePath("/dashboard/admin");
    return { success: "Badge added to company." };
  } catch (error) {
    return { error: errorMessage(error, "Could not add badge.") };
  }
}

export async function revokeProfileBadgeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { profile } = await requireOnboardedUser();
    const profileId = formString(formData, "profileId");
    const badgeId = formString(formData, "badgeId");
    if (!profileId || !badgeId) {
      return { error: "Missing badge." };
    }
    if (profileId !== profile.id && !profile.isPlatformAdmin) {
      return { error: "You can only remove badges from your own profile." };
    }
    await revokeProfileBadge(profileId, badgeId);
    revalidatePath(`/people/${profileId}`);
    return { success: "Badge removed." };
  } catch (error) {
    return { error: errorMessage(error, "Could not remove badge.") };
  }
}

export async function revokeCompanyBadgeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const companyId = formString(formData, "companyId");
    const badgeId = formString(formData, "badgeId");
    if (!companyId || !badgeId) {
      return { error: "Missing badge." };
    }
    const { access, company } = await requireCompanyAccess(companyId);
    if (!canEditCompany(access)) {
      return { error: "You need edit access to remove a company badge." };
    }
    await revokeCompanyBadge(companyId, badgeId);
    revalidatePath(`/companies/${company.slug}`);
    revalidatePath("/companies");
    revalidatePath("/jobs");
    revalidatePath("/");
    return { success: "Badge removed." };
  } catch (error) {
    return { error: errorMessage(error, "Could not remove badge.") };
  }
}

export async function pinProfileBadgeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { profile } = await requireOnboardedUser();
    const profileId = formString(formData, "profileId") || profile.id;
    const raw = formString(formData, "badgeId");
    const badgeId = !raw || raw === "__none__" ? null : raw;
    if (profileId !== profile.id && !profile.isPlatformAdmin) {
      return { error: "You can only pin badges on your own profile." };
    }
    await pinProfileBadge(profileId, badgeId);
    revalidatePath(`/people/${profileId}`);
    revalidatePath("/profile");
    return { success: "Pinned badge updated." };
  } catch (error) {
    return { error: errorMessage(error, "Could not pin badge.") };
  }
}

export async function pinCompanyBadgeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const companyId = formString(formData, "companyId");
    if (!companyId) {
      return { error: "Company required." };
    }
    const { access, company } = await requireCompanyAccess(companyId);
    if (!canEditCompany(access)) {
      return { error: "You need edit access to pin a company badge." };
    }
    const raw = formString(formData, "badgeId");
    const badgeId = !raw || raw === "__none__" ? null : raw;
    await pinCompanyBadge(companyId, badgeId);
    revalidatePath(`/companies/${company.slug}`);
    revalidatePath("/companies");
    revalidatePath("/jobs");
    revalidatePath("/");
    return { success: "Pinned badge updated." };
  } catch (error) {
    return { error: errorMessage(error, "Could not pin badge.") };
  }
}

export async function ownerUpdateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { profile } = await requireOnboardedUser();
    const profileId = formString(formData, "profileId") || profile.id;
    if (profileId !== profile.id && !profile.isPlatformAdmin) {
      return { error: "You can only edit your own profile." };
    }
    const target = await getProfile(profileId);
    if (!target) {
      return { error: "Profile not found." };
    }
    const avatarUrl = formString(formData, "avatarUrl");
    const isDataImage =
      /^data:image\/(jpeg|jpg|png|webp|gif);base64,/i.test(avatarUrl);
    const isRemoteImage = /^https?:\/\//i.test(avatarUrl);
    if (avatarUrl && !isDataImage && !isRemoteImage) {
      return { error: "That profile photo format is not supported." };
    }
    if (isDataImage && avatarUrl.length > 400_000) {
      return { error: "That profile photo is too large." };
    }
    await updateProfile(profileId, {
      fullName: formString(formData, "fullName") || target.fullName || "Member",
      headline: formString(formData, "headline"),
      location: formString(formData, "location"),
      bio: formString(formData, "bio"),
      links: target.links,
      avatarUrl,
    });
    revalidatePath(`/people/${profileId}`);
    revalidatePath("/profile");
    revalidatePath("/", "layout");
    return { success: "Profile updated." };
  } catch (error) {
    return { error: errorMessage(error, "Could not update profile.") };
  }
}

export async function ownerUpdateCompanyAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const companyId = formString(formData, "companyId");
    if (!companyId) {
      return { error: "Company required." };
    }
    const { access, company } = await requireCompanyAccess(companyId);
    if (!canEditCompany(access)) {
      return { error: "You need edit access for this company." };
    }
    const name = formString(formData, "name");
    if (!name) {
      return { error: "Name is required." };
    }
    const input: CompanyWriteInput = {
      name,
      tagline: formString(formData, "tagline") || null,
      description: formString(formData, "description") || null,
      website: formString(formData, "website") || null,
      industry: formString(formData, "industry") || null,
      sizeRange: formString(formData, "sizeRange") || null,
      foundedYear: company.foundedYear,
      locations: company.locations,
      techStack: company.techStack,
      benefits: company.benefits,
      socialLinks: company.socialLinks,
    };
    const updated = await updateCompany(companyId, input);
    revalidatePath(`/companies/${updated.slug}`);
    revalidatePath("/companies");
    revalidatePath("/dashboard/company");
    return { success: "Company updated." };
  } catch (error) {
    return { error: errorMessage(error, "Could not update company.") };
  }
}

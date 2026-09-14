"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/auth/state";
import { requireOnboardedUser } from "@/lib/dashboard";
import { errorMessage } from "@/lib/errors";
import { formString } from "@/lib/form";
import { PLANS } from "@/lib/plans";
import { getCompanyById, setCompanyOverrideTier } from "@/lib/queries";
import type { SubscriptionTier } from "@/lib/types";

const TIER_IDS = new Set(PLANS.map((plan) => plan.id));

async function requirePlatformAdmin() {
  const { profile } = await requireOnboardedUser();
  if (!profile.isPlatformAdmin) {
    throw new Error("Admin access required.");
  }
  return profile;
}

export async function setCompanyTierAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePlatformAdmin();
    const companyId = formString(formData, "companyId");
    const raw = formString(formData, "overrideTier");
    if (!companyId) {
      return { error: "Choose a company." };
    }

    const overrideTier =
      !raw || raw === "__none__"
        ? null
        : TIER_IDS.has(raw as SubscriptionTier)
          ? (raw as SubscriptionTier)
          : null;

    if (raw && raw !== "__none__" && !overrideTier) {
      return { error: "Choose a valid plan." };
    }

    const company = await getCompanyById(companyId);
    if (!company) {
      return { error: "Company not found." };
    }

    await setCompanyOverrideTier(companyId, overrideTier);
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/billing");
    revalidatePath(`/companies/${company.slug}`);
    revalidatePath("/companies");
    revalidatePath("/jobs");
    revalidatePath("/");

    if (!overrideTier) {
      return {
        success: `${company.name} now uses its billed plan (${company.subscriptionTier}).`,
      };
    }
    return {
      success: `${company.name} is now on complimentary ${overrideTier.replaceAll("_", " ")}.`,
    };
  } catch (error) {
    return { error: errorMessage(error, "Could not update company plan.") };
  }
}

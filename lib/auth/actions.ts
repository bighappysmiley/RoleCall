"use server";

import { redirect } from "next/navigation";
import { auth, getOptionalSession } from "@/lib/auth/server";
import type { ActionState } from "@/lib/auth/state";
import {
  applySchema,
  onboardingSchema,
  profileSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@/lib/auth/schemas";
import {
  applyToJob,
  ensureProfile,
  setAccountType,
  toggleSavedJob,
  updateProfile,
} from "@/lib/queries";
import { errorMessage } from "@/lib/errors";
import { formString, safeNextPath } from "@/lib/form";

export async function signUpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    name: formString(formData, "name"),
    email: formString(formData, "email"),
    password: formString(formData, "password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const { error, data } = await auth.signUp.email(parsed.data);
  if (error) {
    return { error: error.message || "Could not create the account." };
  }

  if (data?.user) {
    await ensureProfile({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      image: data.user.image,
    });
  }

  const next = safeNextPath(formString(formData, "next"));
  redirect(next ? `/onboarding?next=${encodeURIComponent(next)}` : "/onboarding");
}

export async function signInAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formString(formData, "email"),
    password: formString(formData, "password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const { error } = await auth.signIn.email(parsed.data);
  if (error) {
    return { error: error.message || "Could not sign in. Check email and password." };
  }

  const session = await getOptionalSession();
  const profile = session?.user
    ? await ensureProfile({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      })
    : null;

  const next = safeNextPath(formString(formData, "next"));
  if (!profile?.accountType) {
    redirect(next ? `/onboarding?next=${encodeURIComponent(next)}` : "/onboarding");
  }
  redirect(next ?? "/dashboard");
}

export async function signOutAction() {
  await auth.signOut();
  redirect("/");
}

export async function requestPasswordResetAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    email: formString(formData, "email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await auth.requestPasswordReset({
    email: parsed.data.email,
    redirectTo: `${siteUrl}/update-password`,
  });
  if (error) {
    return { error: error.message || "Could not send a reset email." };
  }
  return { success: "If that email is on file, a reset link is on its way." };
}

export async function updatePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = updatePasswordSchema.safeParse({
    token: formString(formData, "token"),
    password: formString(formData, "password"),
    confirmPassword: formString(formData, "confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const { error } = await auth.resetPassword({
    newPassword: parsed.data.password,
    token: parsed.data.token,
  });
  if (error) {
    return { error: error.message || "Could not update the password. Request a new link." };
  }
  redirect("/login");
}

export async function completeOnboardingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getOptionalSession();
  if (!session?.user) {
    redirect("/login");
  }

  const parsed = onboardingSchema.safeParse({
    accountType: formString(formData, "accountType"),
  });
  if (!parsed.success) {
    return { error: "Choose whether you are hiring or looking." };
  }

  await ensureProfile({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  });
  await setAccountType(session.user.id, parsed.data.accountType);
  const next = safeNextPath(formString(formData, "next"));
  redirect(next ?? "/dashboard");
}

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getOptionalSession();
  if (!session?.user) {
    redirect("/login");
  }

  const parsed = profileSchema.safeParse({
    fullName: formString(formData, "fullName"),
    headline: formString(formData, "headline"),
    location: formString(formData, "location"),
    bio: formString(formData, "bio"),
    website: formString(formData, "website"),
    linkedin: formString(formData, "linkedin"),
    github: formString(formData, "github"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  await updateProfile(session.user.id, {
    fullName: parsed.data.fullName,
    headline: parsed.data.headline ?? "",
    location: parsed.data.location ?? "",
    bio: parsed.data.bio ?? "",
    links: {
      website: parsed.data.website || undefined,
      linkedin: parsed.data.linkedin || undefined,
      github: parsed.data.github || undefined,
    },
  });

  return { success: "Profile saved." };
}

export async function applyToJobAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getOptionalSession();
  if (!session?.user) {
    redirect("/login");
  }

  const parsed = applySchema.safeParse({
    jobId: formString(formData, "jobId"),
    coverLetter: formString(formData, "coverLetter"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Could not submit the application." };
  }

  const profile = await ensureProfile({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  });
  if (profile?.accountType !== "candidate") {
    return { error: "Switch to a candidate account to apply." };
  }

  try {
    await applyToJob({
      jobId: parsed.data.jobId,
      candidateId: session.user.id,
      coverLetter: parsed.data.coverLetter ?? "",
    });
  } catch (error) {
    return { error: errorMessage(error, "Could not submit the application.") };
  }
  return { success: "Application sent." };
}

export async function toggleSaveJobAction(jobId: string): Promise<ActionState> {
  const session = await getOptionalSession();
  if (!session?.user) {
    redirect("/login");
  }
  await toggleSavedJob(jobId, session.user.id);
  return { success: "Saved jobs updated." };
}

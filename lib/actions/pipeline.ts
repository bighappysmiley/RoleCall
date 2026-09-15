"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { applicationNoteSchema, applicationStageSchema } from "@/lib/auth/schemas";
import type { ActionState } from "@/lib/auth/state";
import { requireCompanyAccess, requireOnboardedUser } from "@/lib/dashboard";
import { errorMessage } from "@/lib/errors";
import { formString } from "@/lib/form";
import { canManageApplications } from "@/lib/permissions";
import {
  addApplicationNote,
  getApplicationForCompany,
  updateApplicationStage,
} from "@/lib/queries";

export async function moveApplicationStageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireOnboardedUser();
  const parsed = applicationStageSchema.safeParse({
    applicationId: formString(formData, "applicationId"),
    stage: formString(formData, "stage"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Could not move that application." };
  }
  const row = await getApplicationForCompany(parsed.data.applicationId);
  if (!row) {
    return { error: "Application not found." };
  }
  const { access } = await requireCompanyAccess(row.company.id);
  if (!canManageApplications(access)) {
    return { error: "You can view the pipeline, but you cannot move cards." };
  }
  try {
    await updateApplicationStage(parsed.data.applicationId, parsed.data.stage);
  } catch (error) {
    return { error: errorMessage(error, "Could not update the stage.") };
  }
  revalidatePath(`/dashboard/jobs/${row.job.id}/pipeline`);
  revalidatePath("/messages");
  revalidatePath("/notifications");
  return { success: "Stage updated." };
}

export async function addApplicationNoteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user, profile } = await requireOnboardedUser();
  const parsed = applicationNoteSchema.safeParse({
    applicationId: formString(formData, "applicationId"),
    body: formString(formData, "body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Could not save the note." };
  }
  const row = await getApplicationForCompany(parsed.data.applicationId);
  if (!row) {
    return { error: "Application not found." };
  }
  const { access } = await requireCompanyAccess(row.company.id);
  if (!canManageApplications(access)) {
    return { error: "You can view notes, but you cannot add them." };
  }
  try {
    await addApplicationNote({
      applicationId: parsed.data.applicationId,
      authorId: user.id,
      body: parsed.data.body,
    });
    const { notifyApplicationNote } = await import("@/lib/messaging");
    await notifyApplicationNote({
      applicationId: parsed.data.applicationId,
      companyId: row.company.id,
      candidateId: row.application.candidateId,
      jobId: row.job.id,
      jobTitle: row.job.title,
      authorId: user.id,
      authorName: profile.fullName ?? "Hiring team",
      body: parsed.data.body,
    });
  } catch (error) {
    return { error: errorMessage(error, "Could not save the note.") };
  }
  revalidatePath(`/dashboard/jobs/${row.job.id}/pipeline`);
  revalidatePath("/notifications");
  return { success: "Private note saved." };
}

export async function messageCandidateAction(formData: FormData) {
  await requireOnboardedUser();
  const applicationId = formString(formData, "applicationId");
  if (!applicationId) {
    throw new Error("Missing application.");
  }
  const row = await getApplicationForCompany(applicationId);
  if (!row) {
    throw new Error("Application not found.");
  }
  const { access } = await requireCompanyAccess(row.company.id);
  if (!canManageApplications(access)) {
    throw new Error("You cannot message candidates from this seat.");
  }

  const { openApplicationConversation } = await import("@/lib/messaging");
  const conversation = await openApplicationConversation({
    applicationId: row.application.id,
    jobId: row.job.id,
    companyId: row.company.id,
    candidateId: row.application.candidateId,
    coverLetter: row.application.coverLetter ?? "",
    jobTitle: row.job.title,
    companyName: row.company.name,
    candidateName: row.candidate.fullName ?? "Candidate",
  });

  revalidatePath(`/dashboard/jobs/${row.job.id}/pipeline`);
  revalidatePath("/messages");
  redirect(`/messages/${conversation.id}`);
}

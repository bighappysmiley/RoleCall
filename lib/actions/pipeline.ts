"use server";

import { revalidatePath } from "next/cache";
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
  return { success: "Stage updated." };
}

export async function addApplicationNoteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user } = await requireOnboardedUser();
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
  } catch (error) {
    return { error: errorMessage(error, "Could not save the note.") };
  }
  revalidatePath(`/dashboard/jobs/${row.job.id}/pipeline`);
  return { success: "Note saved." };
}

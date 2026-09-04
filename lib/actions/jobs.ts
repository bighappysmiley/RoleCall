"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { jobSchema } from "@/lib/auth/schemas";
import type { ActionState } from "@/lib/auth/state";
import { requireCompanyAccess, requireOnboardedUser } from "@/lib/dashboard";
import { errorMessage } from "@/lib/errors";
import { dollarsToCents, formChecked, formString, splitList } from "@/lib/form";
import { assertJobLimit, companyPlan } from "@/lib/plans";
import { canManageJobs } from "@/lib/permissions";
import {
  countPublishedJobs,
  createJob,
  deleteJob,
  getJobById,
  updateJob,
} from "@/lib/queries";
import type { CompanyRecord, JobStatus } from "@/lib/types";
import type { JobWriteInput } from "@/lib/queries";

function jobInputFromForm(formData: FormData): JobWriteInput {
  const parsed = jobSchema.safeParse({
    title: formString(formData, "title"),
    description: formString(formData, "description"),
    responsibilities: formString(formData, "responsibilities"),
    requirements: formString(formData, "requirements"),
    department: formString(formData, "department"),
    employmentType: formString(formData, "employmentType"),
    workplaceType: formString(formData, "workplaceType"),
    location: formString(formData, "location"),
    salaryMin: formString(formData, "salaryMin"),
    salaryMax: formString(formData, "salaryMax"),
    salaryCurrency: formString(formData, "salaryCurrency") || "USD",
    salaryPeriod: formString(formData, "salaryPeriod") || "year",
    showSalary: formString(formData, "showSalary"),
    skills: formString(formData, "skills"),
    experienceLevel: formString(formData, "experienceLevel"),
    status: formString(formData, "status") || "draft",
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Check the form and try again.");
  }
  const salaryMin = dollarsToCents(parsed.data.salaryMin ?? "");
  const salaryMax = dollarsToCents(parsed.data.salaryMax ?? "");
  if (salaryMin != null && salaryMax != null && salaryMin > salaryMax) {
    throw new Error("The minimum salary cannot be higher than the maximum.");
  }
  return {
    title: parsed.data.title,
    description: parsed.data.description,
    responsibilities: parsed.data.responsibilities || null,
    requirements: parsed.data.requirements || null,
    department: parsed.data.department || null,
    employmentType: parsed.data.employmentType,
    workplaceType: parsed.data.workplaceType,
    location: parsed.data.location || null,
    salaryMin,
    salaryMax,
    salaryCurrency: (parsed.data.salaryCurrency || "USD").toUpperCase(),
    salaryPeriod: parsed.data.salaryPeriod || "year",
    showSalary: formChecked(formData, "showSalary") || parsed.data.showSalary === "on",
    skills: splitList(parsed.data.skills ?? ""),
    experienceLevel: parsed.data.experienceLevel || null,
    status: parsed.data.status,
  };
}

async function enforceJobLimit(
  company: CompanyRecord,
  nextStatus: JobStatus,
  currentlyPublished: boolean,
) {
  if (nextStatus !== "published" || currentlyPublished) {
    return;
  }
  const plan = companyPlan(company.subscriptionTier, company.overrideTier);
  const published = await countPublishedJobs(company.id);
  assertJobLimit(plan, published);
}

export async function createJobAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const companyId = formString(formData, "companyId");
  const { access, company } = await requireCompanyAccess(companyId);
  if (!canManageJobs(access)) {
    return { error: "You can view jobs, but you cannot create them." };
  }
  let jobId = "";
  try {
    const input = jobInputFromForm(formData);
    await enforceJobLimit(company, input.status, false);
    const job = await createJob(companyId, input);
    jobId = job.id;
  } catch (error) {
    return { error: errorMessage(error, "Could not create the job.") };
  }
  revalidatePath("/dashboard/jobs");
  revalidatePath("/jobs");
  redirect(`/dashboard/jobs/${jobId}`);
}

export async function updateJobAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireOnboardedUser();
  const jobId = formString(formData, "jobId");
  const job = await getJobById(jobId);
  if (!job) {
    return { error: "Job not found." };
  }
  const { access, company } = await requireCompanyAccess(job.companyId);
  if (!canManageJobs(access)) {
    return { error: "You can view jobs, but you cannot edit them." };
  }
  try {
    const input = jobInputFromForm(formData);
    await enforceJobLimit(company, input.status, job.status === "published");
    await updateJob(jobId, input);
  } catch (error) {
    return { error: errorMessage(error, "Could not save the job.") };
  }
  revalidatePath(`/dashboard/jobs/${jobId}`);
  revalidatePath("/dashboard/jobs");
  revalidatePath("/jobs");
  return { success: "Job saved." };
}

export async function deleteJobAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const jobId = formString(formData, "jobId");
  const job = await getJobById(jobId);
  if (!job) {
    return { error: "Job not found." };
  }
  const { access } = await requireCompanyAccess(job.companyId);
  if (!canManageJobs(access)) {
    return { error: "You cannot delete this job." };
  }
  try {
    await deleteJob(jobId);
  } catch (error) {
    return { error: errorMessage(error, "Could not delete the job.") };
  }
  revalidatePath("/dashboard/jobs");
  revalidatePath("/jobs");
  redirect("/dashboard/jobs");
}

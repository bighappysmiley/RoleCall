import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

export const updatePasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is missing"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const onboardingSchema = z.object({
  accountType: z.enum(["candidate", "employer"]),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(120),
  headline: z.string().trim().max(160).optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  website: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
  linkedin: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
  github: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
});

export const applySchema = z.object({
  jobId: z.string().uuid(),
  coverLetter: z.string().trim().max(4000).optional().or(z.literal("")),
});

const optionalUrl = z.string().trim().url("Enter a valid URL").optional().or(z.literal(""));

export const companySchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(120),
  tagline: z.string().trim().max(160).optional().or(z.literal("")),
  description: z.string().trim().max(8000).optional().or(z.literal("")),
  website: optionalUrl,
  industry: z.string().trim().max(80).optional().or(z.literal("")),
  sizeRange: z.string().trim().max(40).optional().or(z.literal("")),
  foundedYear: z.string().trim().max(4).optional().or(z.literal("")),
  locations: z.string().trim().max(500).optional().or(z.literal("")),
  techStack: z.string().trim().max(500).optional().or(z.literal("")),
  benefits: z.string().trim().max(1000).optional().or(z.literal("")),
  linkedin: optionalUrl,
  twitter: optionalUrl,
  github: optionalUrl,
});

export const jobSchema = z.object({
  title: z.string().trim().min(1, "Job title is required").max(160),
  description: z.string().trim().min(1, "Description is required").max(20000),
  responsibilities: z.string().trim().max(10000).optional().or(z.literal("")),
  requirements: z.string().trim().max(10000).optional().or(z.literal("")),
  department: z.string().trim().max(80).optional().or(z.literal("")),
  employmentType: z.enum(["full_time", "part_time", "contract", "internship"]),
  workplaceType: z.enum(["remote", "hybrid", "onsite"]),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  salaryMin: z.string().trim().max(20).optional().or(z.literal("")),
  salaryMax: z.string().trim().max(20).optional().or(z.literal("")),
  salaryCurrency: z.string().trim().length(3).optional().or(z.literal("")),
  salaryPeriod: z.enum(["year", "month", "hour"]).optional().or(z.literal("")),
  showSalary: z.string().optional(),
  skills: z.string().trim().max(500).optional().or(z.literal("")),
  experienceLevel: z.string().trim().max(40).optional().or(z.literal("")),
  status: z.enum(["draft", "published", "paused", "closed"]),
});

export const inviteSchema = z.object({
  companyId: z.string().uuid(),
  email: z.string().trim().email("Enter a valid email"),
  role: z.enum(["admin", "recruiter", "viewer"]),
});

export const applicationStageSchema = z.object({
  applicationId: z.string().uuid(),
  stage: z.enum([
    "applied",
    "screening",
    "interview",
    "offer",
    "hired",
    "rejected",
  ]),
});

export const applicationNoteSchema = z.object({
  applicationId: z.string().uuid(),
  body: z.string().trim().min(1, "Write a note").max(4000),
});

export const jobBoardFilterSchema = z.object({
  q: z.string().trim().max(120).optional(),
  type: z.enum(["full_time", "part_time", "contract", "internship"]).optional(),
  workplace: z.enum(["remote", "hybrid", "onsite"]).optional(),
  location: z.string().trim().max(120).optional(),
});

export const checkoutPlanSchema = z.object({
  companyId: z.string().uuid(),
  tier: z.enum(["pro", "pro_plus"]),
});

export const checkoutCreditsSchema = z.object({
  companyId: z.string().uuid(),
  packCents: z.coerce.number().int().positive(),
});

export const promoteJobSchema = z.object({
  jobId: z.string().uuid(),
  packCents: z.coerce.number().int().positive(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type CompanyInput = z.infer<typeof companySchema>;
export type JobInput = z.infer<typeof jobSchema>;

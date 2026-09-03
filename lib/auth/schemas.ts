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

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;

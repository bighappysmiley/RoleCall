"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  accountType: z.enum(["candidate", "employer"]),
});

const signInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type AuthFormState = { error?: string } | null;

async function ensureProfile(
  userId: string,
  fullName: string,
  accountType: "candidate" | "employer"
) {
  const existing = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  if (existing[0]) return existing[0];

  const [created] = await db
    .insert(profiles)
    .values({
      id: userId,
      fullName,
      accountType,
    })
    .returning();
  return created;
}

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    accountType: formData.get("accountType"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details" };
  }

  const { name, email, password, accountType } = parsed.data;
  const { data, error } = await auth.signUp.email({
    email,
    password,
    name,
  });

  if (error || !data?.user?.id) {
    return { error: error?.message || "Could not create account" };
  }

  await ensureProfile(data.user.id, name, accountType);

  redirect(accountType === "employer" ? "/dashboard" : "/profile");
}

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details" };
  }

  const { error } = await auth.signIn.email(parsed.data);
  if (error) {
    return { error: error.message || "Could not log in" };
  }

  const { data: session } = await auth.getSession();
  const userId = session?.user?.id;
  if (userId) {
    const rows = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);
    redirect(rows[0]?.accountType === "employer" ? "/dashboard" : "/profile");
  }

  redirect("/jobs");
}

export async function requestPasswordResetAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") || "");
  if (!email.includes("@")) {
    return { error: "Enter a valid email" };
  }

  try {
    // Managed Better Auth password reset endpoint via SDK if available
    const maybe = auth as unknown as {
      forgetPassword?: (args: { email: string; redirectTo: string }) => Promise<{
        error?: { message?: string };
      }>;
      requestPasswordReset?: (args: {
        email: string;
        redirectTo: string;
      }) => Promise<{ error?: { message?: string } }>;
    };
    if (maybe.forgetPassword) {
      const { error } = await maybe.forgetPassword({
        email,
        redirectTo: "/reset-password",
      });
      if (error) return { error: error.message || "Could not send reset email" };
    } else if (maybe.requestPasswordReset) {
      const { error } = await maybe.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
      if (error) return { error: error.message || "Could not send reset email" };
    } else {
      return null;
    }
  } catch {
    return { error: "Could not send reset email. Try again in a moment." };
  }

  return null;
}

export async function signOutAction() {
  await auth.signOut();
  redirect("/");
}

export async function getCurrentProfile() {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return null;
  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1);
  const profile = rows[0];
  return profile
    ? { session, profile }
    : {
        session,
        profile: await ensureProfile(
          session.user.id,
          session.user.name || "User",
          "candidate"
        ),
      };
}

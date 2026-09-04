"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentProfile } from "@/actions/auth";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";

const schema = z.object({
  fullName: z.string().min(1),
  headline: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
});

export async function updateProfileAction(formData: FormData) {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");

  const parsed = schema.safeParse({
    fullName: formData.get("fullName"),
    headline: formData.get("headline") || undefined,
    location: formData.get("location") || undefined,
    bio: formData.get("bio") || undefined,
  });
  if (!parsed.success) {
    redirect("/profile");
  }

  await db
    .update(profiles)
    .set({
      fullName: parsed.data.fullName,
      headline: parsed.data.headline ?? null,
      location: parsed.data.location ?? null,
      bio: parsed.data.bio ?? null,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, current.profile.id));

  redirect("/profile");
}

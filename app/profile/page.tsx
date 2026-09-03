import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/account-forms";
import { getOptionalSession } from "@/lib/auth/server";
import { ensureProfile } from "@/lib/queries";

export const metadata: Metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getOptionalSession();
  if (!session?.user) {
    redirect("/login");
  }

  const profile = await ensureProfile({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  });

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
        CANDIDATE / EMPLOYER
      </p>
      <h1 className="mt-2 font-heading text-4xl">Profile</h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">
        This is the public-facing bio. Resume files are skipped until storage
        is added.
      </p>
      <ProfileForm profile={profile} />
    </div>
  );
}

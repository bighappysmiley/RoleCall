import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/account-forms";
import { getOptionalSession } from "@/lib/auth/server";
import { safeNextPath } from "@/lib/form";
import { ensureProfile } from "@/lib/queries";

export const metadata: Metadata = { title: "Onboarding" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getOptionalSession();
  if (!session?.user) {
    redirect("/login");
  }

  const next = safeNextPath((await searchParams).next);
  const profile = await ensureProfile({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  });
  if (profile?.accountType) {
    redirect(next ?? "/dashboard");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
        STEP 1
      </p>
      <h1 className="mt-2 font-heading text-4xl">How will you use RoleCall?</h1>
      <p className="mt-3 mb-8 max-w-lg text-sm text-muted-foreground">
        You can keep one account. Hiring tools live in the dashboard. Looking
        for work uses the public board and your applications list.
      </p>
      <OnboardingForm next={next} />
    </div>
  );
}
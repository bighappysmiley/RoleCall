import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AcceptInviteForm } from "@/components/accept-invite-form";
import { getOptionalSession } from "@/lib/auth/server";
import { formatRole } from "@/lib/format";
import { isPast } from "@/lib/form";
import { ensureProfile, getInviteByToken } from "@/lib/queries";

type Params = { token: string };

export const metadata: Metadata = { title: "Team invite" };
export const dynamic = "force-dynamic";

export default async function InvitePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { token } = await params;
  const invite = await getInviteByToken(token);
  if (!invite || invite.member.status !== "invited") {
    notFound();
  }

  const expired = isPast(invite.member.inviteExpiresAt);

  const session = await getOptionalSession();
  if (!session?.user) {
    redirect(`/login?next=${encodeURIComponent(`/invite/${token}`)}`);
  }

  const profile = await ensureProfile({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  });
  if (!profile?.accountType) {
    redirect(`/onboarding?next=${encodeURIComponent(`/invite/${token}`)}`);
  }

  const email = session.user.email?.toLowerCase() ?? "";
  const invited = invite.member.invitedEmail?.toLowerCase() ?? "";
  const matches = Boolean(email && invited && email === invited);

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
        INVITE
      </p>
      <h1 className="mt-2 font-heading text-4xl">Join {invite.company.name}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This seat is {formatRole(invite.member.role).toLowerCase()} for{" "}
        {invite.member.invitedEmail}.
      </p>
      {expired ? (
        <p className="mt-6 border border-line bg-fog px-4 py-3 text-sm">
          This invite has expired. Ask an admin for a new link.
        </p>
      ) : !matches ? (
        <p className="mt-6 border border-line bg-fog px-4 py-3 text-sm">
          Sign in with {invite.member.invitedEmail} to accept. You are signed in
          as {session.user.email ?? "an account without email"}.
        </p>
      ) : (
        <AcceptInviteForm token={token} />
      )}
      <p className="mt-6 text-sm text-muted-foreground">
        <Link href="/dashboard" className="text-primary hover:underline">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}

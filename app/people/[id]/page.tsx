import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeIcon, NameWithBadge } from "@/components/badge-icon";
import { ProfileOwnerEditor } from "@/components/owner-editor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getOptionalSession } from "@/lib/auth/server";
import { listBadges, listProfileBadges } from "@/lib/badge-queries";
import { initials } from "@/lib/format";
import { ensureProfile, getProfile } from "@/lib/queries";

type Params = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const profile = await getProfile(id);
  return { title: profile?.fullName ?? "Profile" };
}

export default async function PersonPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const profile = await getProfile(id);
  if (!profile) {
    notFound();
  }

  const [assigned, catalog, session] = await Promise.all([
    listProfileBadges(profile.id),
    listBadges(),
    getOptionalSession(),
  ]);
  const pinned = assigned.find((badge) => badge.isPinned) ?? null;

  let canEdit = false;
  if (session?.user) {
    const viewer = await ensureProfile({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    });
    if (viewer) {
      canEdit = viewer.id === profile.id || viewer.isPlatformAdmin;
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="border border-line bg-paper p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar className="size-16 shrink-0 border border-line">
              {profile.avatarUrl ? (
                <AvatarImage src={profile.avatarUrl} alt="" />
              ) : null}
              <AvatarFallback className="bg-fog text-lg font-medium text-ink">
                {initials(profile.fullName ?? "Member")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
                PROFILE
              </p>
              <h1 className="mt-2 font-heading text-4xl">
                <NameWithBadge
                  name={profile.fullName ?? "Member"}
                  badge={pinned}
                  badgeSize={28}
                />
              </h1>
              {profile.headline ? (
                <p className="mt-2 text-muted-foreground">{profile.headline}</p>
              ) : null}
              {profile.location ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {profile.location}
                </p>
              ) : null}
            </div>
          </div>
          {canEdit ? (
            <ProfileOwnerEditor
              profile={profile}
              assigned={assigned}
              catalog={catalog}
              canAward={canEdit}
            />
          ) : null}
        </div>
        {profile.bio ? (
          <p className="mt-6 whitespace-pre-line text-sm leading-6">
            {profile.bio}
          </p>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            No bio yet.
          </p>
        )}
        {profile.resumeUrl ||
        profile.links.website ||
        profile.links.linkedin ||
        profile.links.github ||
        profile.links.portfolio ? (
          <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {profile.resumeUrl ? (
              <li>
                <a
                  href={profile.resumeUrl}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Resume
                </a>
              </li>
            ) : null}
            {profile.links.website ? (
              <li>
                <a
                  href={profile.links.website}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Website
                </a>
              </li>
            ) : null}
            {profile.links.linkedin ? (
              <li>
                <a
                  href={profile.links.linkedin}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
              </li>
            ) : null}
            {profile.links.github ? (
              <li>
                <a
                  href={profile.links.github}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              </li>
            ) : null}
            {profile.links.portfolio ? (
              <li>
                <a
                  href={profile.links.portfolio}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Portfolio
                </a>
              </li>
            ) : null}
          </ul>
        ) : null}
        {assigned.length > 0 ? (
          <ul className="mt-6 flex flex-wrap gap-2">
            {assigned.map((badge) => (
              <li
                key={badge.assignmentId}
                className="inline-flex items-center gap-1.5 border border-line px-2 py-1 text-sm"
                title={badge.description ?? badge.name}
              >
                <BadgeIcon badge={badge} size={18} />
                {badge.name}
                {badge.isPinned ? (
                  <span className="font-mono text-[10px] tracking-wider text-primary">
                    PINNED
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

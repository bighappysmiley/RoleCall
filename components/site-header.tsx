import { cookies } from "next/headers";
import { getOptionalSession } from "@/lib/auth/server";
import { HeaderNav } from "@/components/header-nav";
import { canManageJobs, canManageTeam } from "@/lib/permissions";
import {
  countUnreadNotifications,
  listConversations,
  listNotifications,
  listOwnedCompanies,
  resolveInboxIdentity,
  INBOX_COOKIE,
} from "@/lib/messaging";
import { ensureProfile, listMemberships } from "@/lib/queries";
import type { CreateNewItem } from "@/components/create-new-menu";

export async function SiteHeader() {
  const session = await getOptionalSession();
  if (!session?.user) {
    return (
      <HeaderNav
        signedIn={false}
        isAdmin={false}
        createItems={[
          {
            href: "/signup",
            label: "Create a profile",
            hint: "Show who you are on RoleCall",
          },
          {
            href: "/signup",
            label: "Post a role",
            hint: "List an opening for your team",
          },
          {
            href: "/signup",
            label: "Create a company",
            hint: "Start hiring as a company",
          },
        ]}
        messagePreview={[]}
        notificationPreview={[]}
        unreadNotifications={0}
        ownedCompanies={[]}
        inbox="personal"
      />
    );
  }

  const profile = await ensureProfile({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  });

  const jar = await cookies();
  const identity = await resolveInboxIdentity(
    session.user.id,
    jar.get(INBOX_COOKIE)?.value,
  );
  const memberships = await listMemberships(session.user.id);
  const ownedCompanies = await listOwnedCompanies(session.user.id);

  const canPostRole = memberships.some((row) =>
    canManageJobs({
      companyId: row.company.id,
      isPlatformAdmin: Boolean(profile?.isPlatformAdmin),
      role: row.role,
    }),
  );
  const canInvite = memberships.some((row) =>
    canManageTeam({
      companyId: row.company.id,
      isPlatformAdmin: Boolean(profile?.isPlatformAdmin),
      role: row.role,
    }),
  );
  const hasCompany = memberships.length > 0;

  const createItems: CreateNewItem[] = [];
  if (canPostRole) {
    createItems.push({
      href: "/dashboard/jobs/new",
      label: "Post a role",
      hint: "List an opening on the board",
    });
  }
  if (!hasCompany) {
    createItems.push({
      href: "/dashboard/company",
      label: "Create a company",
      hint: "Set up your hiring page",
    });
  }
  createItems.push({
    href: "/profile",
    label: "Update your profile",
    hint: "Keep your RoleCall page current",
  });
  if (canInvite) {
    createItems.push({
      href: "/dashboard/team",
      label: "Invite a teammate",
      hint: "Add someone to your company",
    });
  }

  const [messagePreview, notificationPreview, unreadNotifications] =
    await Promise.all([
      listConversations({
        userId: session.user.id,
        identity,
        filter: "all",
        limit: 3,
      }),
      listNotifications(session.user.id, 3),
      countUnreadNotifications(session.user.id),
    ]);

  return (
    <HeaderNav
      signedIn
      isAdmin={Boolean(profile?.isPlatformAdmin)}
      name={session.user.name}
      email={session.user.email}
      image={session.user.image}
      createItems={createItems}
      messagePreview={messagePreview}
      notificationPreview={notificationPreview}
      unreadNotifications={unreadNotifications}
      ownedCompanies={ownedCompanies.map((row) => ({
        id: row.id,
        name: row.name,
        logoUrl: row.logoUrl,
      }))}
      inbox={identity.kind === "personal" ? "personal" : identity.companyId}
    />
  );
}

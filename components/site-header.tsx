import { getOptionalSession } from "@/lib/auth/server";
import { ensureProfile } from "@/lib/queries";
import { HeaderNav } from "@/components/header-nav";

export async function SiteHeader() {
  const session = await getOptionalSession();
  const profile = session?.user
    ? await ensureProfile({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      })
    : null;

  return (
    <HeaderNav
      signedIn={Boolean(session?.user)}
      isAdmin={Boolean(profile?.isPlatformAdmin)}
      name={profile?.fullName ?? session?.user?.name}
      email={session?.user?.email}
      image={profile?.avatarUrl ?? session?.user?.image}
    />
  );
}

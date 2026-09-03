import Link from "next/link";
import { getOptionalSession } from "@/lib/auth/server";
import { ensureProfile } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";
import { MobileNav } from "@/components/mobile-nav";
import { SignOutButton } from "@/components/sign-out-button";

const NAV = [
  { href: "/jobs", label: "Jobs" },
  { href: "/companies", label: "Companies" },
  { href: "/pricing", label: "Pricing" },
];

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
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-8">
          <Wordmark />
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          {session?.user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile">Profile</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <SignOutButton />
              {profile?.isPlatformAdmin ? (
                <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                  ADMIN
                </span>
              ) : null}
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Post a job</Link>
              </Button>
            </>
          )}
        </div>
        <MobileNav
          signedIn={Boolean(session?.user)}
          isAdmin={Boolean(profile?.isPlatformAdmin)}
        />
      </div>
    </header>
  );
}

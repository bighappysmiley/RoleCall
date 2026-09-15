"use client";

import Link from "next/link";
import { Bell, ChevronDown, MessageCircle } from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wordmark } from "@/components/wordmark";
import { MobileNav } from "@/components/mobile-nav";

const EXPLORE = [
  { href: "/jobs", label: "Browse jobs", hint: "Live roles on the board" },
  { href: "/companies", label: "Companies", hint: "Teams hiring now" },
  { href: "/pricing", label: "Pricing", hint: "Plans that stay clear" },
];

const FIND_WORK = [
  { href: "/jobs", label: "Open roles", hint: "Apply in minutes" },
  { href: "/signup", label: "Create a profile", hint: "Show what you do" },
  { href: "/pricing", label: "How placement works", hint: "Paid rails stay labeled" },
];

const HIRE = [
  { href: "/signup", label: "Post a job", hint: "Start hiring today" },
  { href: "/pricing", label: "Compare plans", hint: "Free to Pro Plus" },
  { href: "/companies", label: "Company pages", hint: "Build your presence" },
];

function NavDropdown({
  label,
  items,
}: {
  label: string;
  items: { href: string; label: string; hint: string }[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-ink/80 outline-none transition-colors hover:bg-fog hover:text-ink data-[state=open]:bg-fog data-[state=open]:text-ink">
        {label}
        <ChevronDown className="size-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56 rounded-xl p-1.5">
        {items.map((item) => (
          <DropdownMenuItem key={item.href + item.label} asChild>
            <Link href={item.href} className="flex flex-col items-start gap-0.5 rounded-lg px-3 py-2">
              <span className="text-sm font-medium text-ink">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.hint}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-fog hover:text-ink"
    >
      {children}
    </Link>
  );
}

export function HeaderNav({
  signedIn,
  isAdmin,
  name,
  email,
  image,
}: {
  signedIn: boolean;
  isAdmin: boolean;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}) {
  const initials =
    (name ?? email ?? "U")
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 border-b border-line/50 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-6 lg:gap-8">
          <Wordmark />
          <nav className="hidden items-center gap-0.5 md:flex">
            <NavDropdown label="Explore" items={EXPLORE} />
            <NavDropdown label="Find work" items={FIND_WORK} />
            <NavDropdown label="Hire talent" items={HIRE} />
          </nav>
        </div>

        <div className="hidden items-center gap-1.5 md:flex">
          {signedIn ? (
            <>
              <IconLink href="/dashboard" label="Notifications">
                <Bell className="size-4" />
              </IconLink>
              <IconLink href="/dashboard" label="Messages">
                <MessageCircle className="size-4" />
              </IconLink>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="ml-1 rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label="Account menu"
                >
                  <Avatar size="sm" className="size-8">
                    {image ? <AvatarImage src={image} alt="" /> : null}
                    <AvatarFallback className="bg-mist text-[11px] font-medium text-navy">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-48 rounded-xl">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium text-ink">
                      {name ?? "Your account"}
                    </p>
                    {email ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {email}
                      </p>
                    ) : null}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  {isAdmin ? (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/admin">Admin</Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <form action={signOutAction} className="w-full">
                      <button type="submit" className="w-full text-left">
                        Sign out
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="rounded-full" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" className="rounded-full px-4" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        <MobileNav signedIn={signedIn} isAdmin={isAdmin} />
      </div>
    </header>
  );
}

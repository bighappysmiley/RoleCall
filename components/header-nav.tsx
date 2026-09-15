"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
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
import {
  CreateNewMenu,
  type CreateNewItem,
} from "@/components/create-new-menu";
import { MessagesMenu } from "@/components/messages-menu";
import { NotificationsMenu } from "@/components/notifications-menu";
import type { ConversationPreview, NotificationRecord } from "@/lib/types";

const EXPLORE = [
  { href: "/jobs", label: "Browse jobs", hint: "Open roles on the board" },
  { href: "/companies", label: "Companies", hint: "Teams hiring now" },
  { href: "/people", label: "People", hint: "Public candidate profiles" },
  { href: "/pricing", label: "Pricing", hint: "Clear plans for every stage" },
];

const HIRE_TALENT = [
  { href: "/signup", label: "Post a job", hint: "Start hiring today" },
  { href: "/pricing", label: "Compare plans", hint: "Free through Pro Plus" },
  { href: "/people", label: "Browse people", hint: "Find candidates" },
  { href: "/companies", label: "Company pages", hint: "Show your team" },
];

const GET_HIRED = [
  { href: "/jobs", label: "Find roles", hint: "Apply in minutes" },
  { href: "/people", label: "People directory", hint: "See how profiles look" },
  { href: "/signup", label: "Create a profile", hint: "Show your work" },
  { href: "/pricing", label: "How placement works", hint: "Paid rails stay labeled" },
];

const COMMUNITY = [
  { href: "/companies", label: "Companies", hint: "Browse hiring teams" },
  { href: "/people", label: "People", hint: "Public profiles" },
  { href: "/jobs", label: "Open roles", hint: "What's live now" },
  { href: "/signup", label: "Join RoleCall", hint: "Create a free account" },
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
      <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[15px] text-ink/80 outline-none transition-colors hover:text-ink data-[state=open]:text-ink">
        {label}
        <ChevronDown className="size-3.5 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56 rounded-xl border-line p-1.5 shadow-md">
        {items.map((item) => (
          <DropdownMenuItem key={item.href + item.label} asChild>
            <Link
              href={item.href}
              className="flex flex-col items-start gap-0.5 rounded-lg px-3 py-2"
            >
              <span className="text-sm font-medium text-ink">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.hint}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function HeaderNav({
  signedIn,
  isAdmin,
  name,
  email,
  image,
  createItems,
  messagePreview,
  notificationPreview,
  unreadMessages = 0,
  unreadNotifications,
  ownedCompanies: _ownedCompanies,
  inbox: _inbox,
}: {
  signedIn: boolean;
  isAdmin: boolean;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  createItems: CreateNewItem[];
  messagePreview: ConversationPreview[];
  notificationPreview: NotificationRecord[];
  unreadMessages?: number;
  unreadNotifications: number;
  ownedCompanies: { id: string; name: string; logoUrl: string | null }[];
  inbox: string;
}) {
  void _ownedCompanies;
  void _inbox;
  const initials =
    (name ?? email ?? "U")
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-5 lg:gap-7">
          <Wordmark />
          <nav className="hidden items-center gap-0.5 md:flex">
            <NavDropdown label="Explore" items={EXPLORE} />
            <NavDropdown label="Hire Talent" items={HIRE_TALENT} />
            <NavDropdown label="Get Hired" items={GET_HIRED} />
            <NavDropdown label="Community" items={COMMUNITY} />
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <CreateNewMenu items={createItems} />
          <MessagesMenu
            signedIn={signedIn}
            preview={messagePreview}
            unreadCount={unreadMessages}
          />
          <NotificationsMenu
            signedIn={signedIn}
            preview={notificationPreview}
            unreadCount={unreadNotifications}
          />
          {signedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="ml-0.5 rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label="Account menu"
              >
                <Avatar className="size-8">
                  {image ? <AvatarImage src={image} alt="" /> : null}
                  <AvatarFallback className="bg-fog text-[11px] font-medium text-ink">
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
                <DropdownMenuItem asChild>
                  <Link href="/messages">Messages</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/notifications">Notifications</Link>
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
          ) : (
            <Button variant="ghost" size="sm" className="rounded-full" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>

        <MobileNav signedIn={signedIn} isAdmin={isAdmin} />
      </div>
    </header>
  );
}

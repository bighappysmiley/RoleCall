"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV = [
  { href: "/jobs", label: "Jobs" },
  { href: "/companies", label: "Companies" },
  { href: "/pricing", label: "Pricing" },
];

export function MobileNav({
  signedIn,
  isAdmin,
}: {
  signedIn: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);

  function NavLink({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) {
    return (
      <Link href={href} className="py-1" onClick={() => setOpen(false)}>
        {children}
      </Link>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-white md:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-4" />
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle className="font-display">RoleCall</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-3 px-4 text-sm">
          <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            Explore
          </p>
          {NAV.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
          <div className="my-2 h-px bg-line" />
          {signedIn ? (
            <>
              <NavLink href="/notifications">Notifications</NavLink>
              <NavLink href="/dashboard/jobs/new">Post a role</NavLink>
              <NavLink href="/messages">Messages</NavLink>
              <NavLink href="/profile">Profile</NavLink>
              <NavLink href="/dashboard">Dashboard</NavLink>
              {isAdmin ? (
                <NavLink href="/dashboard/admin">Admin panel</NavLink>
              ) : null}
              <form action={signOutAction}>
                <Button type="submit" variant="outline" size="sm" className="rounded-full">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <NavLink href="/login">Sign in</NavLink>
              <NavLink href="/signup">Sign up</NavLink>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

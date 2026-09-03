"use client";

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
  return (
    <Sheet>
      <SheetTrigger
        className="inline-flex size-8 items-center justify-center border border-line md:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-4" />
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle className="font-heading">RoleCall</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-3 px-4 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="py-1">
              {item.label}
            </Link>
          ))}
          <div className="my-2 h-px bg-line" />
          {signedIn ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/profile">Profile</Link>
              {isAdmin ? (
                <p className="font-mono text-[10px] tracking-wider text-muted-foreground">
                  ADMIN
                </p>
              ) : null}
              <form action={signOutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Sign in</Link>
              <Link href="/signup">Create account</Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type CreateNewItem = {
  href: string;
  label: string;
  hint: string;
};

export function CreateNewMenu({ items }: { items: CreateNewItem[] }) {
  if (items.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-9 rounded-full border-line bg-white px-3.5 text-sm"
        asChild
      >
        <Link href="/onboarding">
          <Plus className="size-3.5" />
          Create New
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-full border-line bg-white px-3.5 text-sm"
        >
          <Plus className="size-3.5" />
          Create New
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-64 rounded-xl border-line p-1.5 shadow-md">
        <DropdownMenuLabel className="px-3 py-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Create New
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
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

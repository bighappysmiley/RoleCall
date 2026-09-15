"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { formatPostedAt } from "@/lib/format";
import type { NotificationRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

export function NotificationsMenu({
  signedIn,
  preview,
  unreadCount,
}: {
  signedIn: boolean;
  preview: NotificationRecord[];
  unreadCount: number;
}) {
  if (!signedIn) {
    return (
      <Link
        href="/login"
        aria-label="Notifications"
        className="inline-flex size-9 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-fog hover:text-ink"
      >
        <Bell className="size-4" />
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link
        href="/notifications"
        aria-label="Notifications"
        className="relative inline-flex size-9 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-fog hover:text-ink"
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
        ) : null}
      </Link>
      <div className="pointer-events-none invisible absolute right-0 z-50 mt-2 w-80 translate-y-1 rounded-2xl border border-line bg-white p-3 opacity-0 shadow-lg transition-all duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-sm font-semibold text-ink">Notifications</p>
          <Link
            href="/notifications"
            className="text-xs text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        {preview.length === 0 ? (
          <p className="px-1 py-4 text-sm text-muted-foreground">
            You are all caught up.
          </p>
        ) : (
          <ul className="space-y-1">
            {preview.slice(0, 3).map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href ?? "/notifications"}
                  className={cn(
                    "block rounded-xl px-2 py-2 transition-colors hover:bg-fog",
                    !item.readAt && "bg-fog/60",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-ink">{item.title}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatPostedAt(item.createdAt)}
                    </span>
                  </div>
                  {item.body ? (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {item.body}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatPostedAt, initials } from "@/lib/format";
import type { ConversationPreview } from "@/lib/types";

export function MessagesMenu({
  signedIn,
  preview,
}: {
  signedIn: boolean;
  preview: ConversationPreview[];
}) {
  if (!signedIn) {
    return (
      <Link
        href="/login"
        aria-label="Messages"
        className="inline-flex size-9 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-fog hover:text-ink"
      >
        <MessageCircle className="size-4" />
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link
        href="/messages"
        aria-label="Messages"
        className="inline-flex size-9 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-fog hover:text-ink"
      >
        <MessageCircle className="size-4" />
      </Link>
      <div className="pointer-events-none invisible absolute right-0 z-50 mt-2 w-80 translate-y-1 rounded-2xl border border-line bg-white p-3 opacity-0 shadow-lg transition-all duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-sm font-semibold text-ink">Your messages</p>
          <Link href="/messages" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        {preview.length === 0 ? (
          <p className="px-1 py-4 text-sm text-muted-foreground">
            No messages yet. Apply to a role or post one to start a thread.
          </p>
        ) : (
          <ul className="space-y-1">
            {preview.slice(0, 3).map((item) => (
              <li key={item.id}>
                <Link
                  href={`/messages/${item.id}`}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-fog"
                >
                  <Avatar className="size-9">
                    {item.counterpartImage ? (
                      <AvatarImage src={item.counterpartImage} alt="" />
                    ) : null}
                    <AvatarFallback className="bg-fog text-[10px] font-medium text-ink">
                      {initials(item.counterpartName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium text-ink">
                        {item.counterpartName}
                      </p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatPostedAt(item.lastMessageAt)}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.lastBody ?? item.subject ?? "Conversation"}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

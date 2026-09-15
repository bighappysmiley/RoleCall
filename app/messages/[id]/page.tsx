import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  markConversationReadAction,
  sendMessageAction,
  toggleArchiveAction,
  toggleFavoriteAction,
} from "@/lib/actions/messaging";
import { requireUser } from "@/lib/dashboard";
import { formatPostedAt, formatShortDate, initials } from "@/lib/format";
import {
  INBOX_COOKIE,
  getConversationForViewer,
  listMessages,
  resolveInboxIdentity,
} from "@/lib/messaging";

export const dynamic = "force-dynamic";

export default async function MessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, profile } = await requireUser(`/messages/${id}`);
  if (!profile.accountType && !profile.isPlatformAdmin) {
    redirect("/onboarding");
  }

  const jar = await cookies();
  const identity = await resolveInboxIdentity(
    user.id,
    jar.get(INBOX_COOKIE)?.value,
  );
  const access = await getConversationForViewer(id, user.id, identity);
  if (!access) {
    notFound();
  }

  await markConversationReadAction(id);
  const thread = await listMessages(id);
  const { conversation, participant } = access;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/messages"
            className="text-sm text-muted-foreground hover:text-ink"
          >
            ← Messages
          </Link>
          <h1 className="mt-2 font-display text-3xl tracking-[-0.04em] text-ink">
            {conversation.subject ?? "Conversation"}
          </h1>
          <p className="mt-1 text-sm capitalize text-muted-foreground">
            {conversation.category}
          </p>
        </div>
        <div className="flex gap-2">
          <form action={toggleFavoriteAction}>
            <input type="hidden" name="conversationId" value={id} />
            <input
              type="hidden"
              name="next"
              value={participant.isFavorite ? "false" : "true"}
            />
            <Button type="submit" variant="outline" size="sm" className="rounded-full">
              {participant.isFavorite ? "Unfavorite" : "Favorite"}
            </Button>
          </form>
          <form action={toggleArchiveAction}>
            <input type="hidden" name="conversationId" value={id} />
            <input
              type="hidden"
              name="next"
              value={participant.isArchived ? "false" : "true"}
            />
            <Button type="submit" variant="outline" size="sm" className="rounded-full">
              {participant.isArchived ? "Move to inbox" : "Archive"}
            </Button>
          </form>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white">
        <div className="space-y-4 px-5 py-5">
          {thread.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            thread.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar className="size-9">
                  {message.senderAvatarUrl ? (
                    <AvatarImage src={message.senderAvatarUrl} alt="" />
                  ) : null}
                  <AvatarFallback className="bg-fog text-[10px]">
                    {initials(message.senderName ?? "User")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <p className="text-sm font-medium text-ink">
                      {message.senderName ?? "User"}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatShortDate(message.createdAt)} ·{" "}
                      {formatPostedAt(message.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink/90">
                    {message.body}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <form
          action={sendMessageAction}
          className="border-t border-line px-5 py-4"
        >
          <input type="hidden" name="conversationId" value={id} />
          <label htmlFor="body" className="sr-only">
            Message
          </label>
          <textarea
            id="body"
            name="body"
            required
            rows={4}
            placeholder="Write a reply…"
            className="w-full resize-y rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <div className="mt-3 flex justify-end">
            <Button type="submit" className="rounded-full">
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

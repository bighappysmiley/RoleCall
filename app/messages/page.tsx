import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { switchInboxAction } from "@/lib/actions/messaging";
import { requireUser } from "@/lib/dashboard";
import { formatPostedAt, initials } from "@/lib/format";
import {
  INBOX_COOKIE,
  listConversations,
  listOwnedCompanies,
  resolveInboxIdentity,
} from "@/lib/messaging";
import type { ConversationFilter } from "@/lib/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_FILTERS: { id: ConversationFilter; label: string }[] = [
  { id: "all", label: "All messages" },
  { id: "unread", label: "Unread" },
  { id: "favorites", label: "Favorites" },
  { id: "archive", label: "Archive" },
];

const BOARD_FILTERS: { id: ConversationFilter; label: string }[] = [
  { id: "applications", label: "Applications" },
  { id: "interviews", label: "Interviews" },
  { id: "offers", label: "Offers" },
  { id: "team", label: "Team" },
  { id: "inquiries", label: "Inquiries" },
];

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { user, profile } = await requireUser("/messages");
  if (!profile.accountType && !profile.isPlatformAdmin) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const allowed = new Set([
    "all",
    "unread",
    "favorites",
    "archive",
    "applications",
    "interviews",
    "offers",
    "team",
    "inquiries",
  ]);
  const filter = (
    allowed.has(params.filter ?? "") ? params.filter : "all"
  ) as ConversationFilter;

  const jar = await cookies();
  const identity = await resolveInboxIdentity(
    user.id,
    jar.get(INBOX_COOKIE)?.value,
  );
  const ownedCompanies = await listOwnedCompanies(user.id);
  const conversations = await listConversations({
    userId: user.id,
    identity,
    filter,
  });

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-6">
        <div>
          <h1 className="font-display text-3xl tracking-[-0.04em] text-ink">
            Messages
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hiring threads for roles, interviews, and your team.
          </p>
        </div>

        {ownedCompanies.length > 0 ? (
          <div className="rounded-2xl border border-line bg-white p-3">
            <p className="px-1 text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
              Viewing as
            </p>
            <form action={switchInboxAction} className="mt-2 space-y-1">
              <button
                type="submit"
                name="inbox"
                value="personal"
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-fog",
                  identity.kind === "personal" && "bg-fog",
                )}
              >
                <Avatar className="size-8">
                  {profile.avatarUrl ? (
                    <AvatarImage src={profile.avatarUrl} alt="" />
                  ) : null}
                  <AvatarFallback className="bg-white text-[10px]">
                    {initials(profile.fullName ?? "You")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-ink">
                  {profile.fullName ?? "You"}
                </span>
              </button>
              {ownedCompanies.map((company) => (
                <button
                  key={company.id}
                  type="submit"
                  name="inbox"
                  value={company.id}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-fog",
                    identity.kind === "company" &&
                      identity.companyId === company.id &&
                      "bg-fog",
                  )}
                >
                  <Avatar className="size-8">
                    {company.logoUrl ? (
                      <AvatarImage src={company.logoUrl} alt="" />
                    ) : null}
                    <AvatarFallback className="bg-white text-[10px]">
                      {initials(company.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-ink">
                    {company.name}
                  </span>
                </button>
              ))}
            </form>
          </div>
        ) : null}

        <nav className="space-y-1">
          {STATUS_FILTERS.map((item) => (
            <Link
              key={item.id}
              href={`/messages?filter=${item.id}`}
              className={cn(
                "block rounded-xl px-3 py-2 text-sm transition-colors hover:bg-fog",
                filter === item.id
                  ? "bg-fog font-medium text-ink"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="my-3 h-px bg-line" />
          {BOARD_FILTERS.map((item) => (
            <Link
              key={item.id}
              href={`/messages?filter=${item.id}`}
              className={cn(
                "block rounded-xl px-3 py-2 text-sm transition-colors hover:bg-fog",
                filter === item.id
                  ? "bg-fog font-medium text-ink"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <section className="min-w-0 rounded-2xl border border-line bg-white">
        {conversations.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-base font-medium text-ink">No messages here</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Threads appear when someone applies, you move a candidate through
              the pipeline, or you invite a teammate.
            </p>
            <Button asChild className="mt-5 rounded-full" size="sm">
              <Link href="/jobs">Browse jobs</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {conversations.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/messages/${item.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-fog/70"
                >
                  <Avatar className="size-11">
                    {item.counterpartImage ? (
                      <AvatarImage src={item.counterpartImage} alt="" />
                    ) : null}
                    <AvatarFallback className="bg-fog text-xs font-medium">
                      {initials(item.counterpartName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "truncate text-sm text-ink",
                            item.unread ? "font-semibold" : "font-medium",
                          )}
                        >
                          {item.counterpartName}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {item.lastBody ?? item.subject ?? "Conversation"}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatPostedAt(item.lastMessageAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

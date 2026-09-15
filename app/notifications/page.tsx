import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/actions/messaging";
import { requireUser } from "@/lib/dashboard";
import { formatPostedAt } from "@/lib/format";
import { listNotifications } from "@/lib/messaging";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const { user, profile } = await requireUser("/notifications");
  if (!profile.accountType && !profile.isPlatformAdmin) {
    redirect("/onboarding");
  }

  const items = await listNotifications(user.id, 100);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-[-0.04em] text-ink">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Applications, pipeline updates, invites, and messages.
          </p>
        </div>
        {items.some((item) => !item.readAt) ? (
          <form action={markAllNotificationsReadAction}>
            <Button type="submit" variant="outline" size="sm" className="rounded-full">
              Mark all read
            </Button>
          </form>
        ) : null}
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-white">
        {items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-base font-medium text-ink">No notifications yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              You will see updates here when applications arrive or someone
              messages you.
            </p>
            <Button asChild className="mt-5 rounded-full" size="sm">
              <Link href="/jobs">Browse jobs</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li key={item.id} className={cn(!item.readAt && "bg-fog/40")}>
                <div className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    {item.href ? (
                      <form action={markNotificationReadAction}>
                        <input
                          type="hidden"
                          name="notificationId"
                          value={item.id}
                        />
                        <button type="submit" className="text-left">
                          <Link
                            href={item.href}
                            className="text-sm font-medium text-ink hover:underline"
                          >
                            {item.title}
                          </Link>
                        </button>
                      </form>
                    ) : (
                      <p className="text-sm font-medium text-ink">{item.title}</p>
                    )}
                    {item.body ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.body}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatPostedAt(item.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

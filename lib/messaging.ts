import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { getDb, requireDb } from "@/lib/db";
import {
  applications,
  companies,
  companyMembers,
  conversationParticipants,
  conversations,
  jobs,
  messages,
  notifications,
  profiles,
} from "@/lib/db/schema";
import type {
  ApplicationStage,
  ConversationCategory,
  ConversationFilter,
  ConversationPreview,
  InboxIdentity,
  MessageRecord,
  NotificationRecord,
  ProfileRecord,
} from "@/lib/types";

export const INBOX_COOKIE = "rolecall-inbox";

function stageToCategory(stage: ApplicationStage): ConversationCategory {
  if (stage === "interview") return "interviews";
  if (stage === "offer" || stage === "hired") return "offers";
  return "applications";
}

export async function listOwnedCompanies(userId: string) {
  const db = getDb();
  if (!db) return [];
  return db
    .select({
      id: companies.id,
      name: companies.name,
      logoUrl: companies.logoUrl,
      role: companyMembers.role,
    })
    .from(companyMembers)
    .innerJoin(companies, eq(companyMembers.companyId, companies.id))
    .where(
      and(
        eq(companyMembers.userId, userId),
        eq(companyMembers.status, "active"),
        eq(companyMembers.role, "owner"),
      ),
    );
}

export async function resolveInboxIdentity(
  userId: string,
  raw: string | undefined,
): Promise<InboxIdentity> {
  if (!raw || raw === "me" || raw === "personal") {
    return { kind: "personal" };
  }
  const owned = await listOwnedCompanies(userId);
  if (owned.some((row) => row.id === raw)) {
    return { kind: "company", companyId: raw };
  }
  return { kind: "personal" };
}

export async function createNotification(input: {
  userId: string;
  companyId?: string | null;
  type: string;
  title: string;
  body?: string;
  href?: string;
}) {
  const db = requireDb();
  await db.insert(notifications).values({
    userId: input.userId,
    companyId: input.companyId ?? null,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    href: input.href ?? null,
  });
}

export async function notifyCompanyTeam(
  companyId: string,
  input: {
    type: string;
    title: string;
    body?: string;
    href?: string;
    excludeUserId?: string;
  },
) {
  const hiringUsers = await listHiringUserIds(companyId);
  for (const userId of hiringUsers) {
    if (input.excludeUserId && userId === input.excludeUserId) continue;
    await createNotification({
      userId,
      companyId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href,
    });
  }
}

export async function listNotifications(
  userId: string,
  limit = 30,
): Promise<NotificationRecord[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    companyId: row.companyId,
    type: row.type,
    title: row.title,
    body: row.body,
    href: row.href,
    readAt: row.readAt,
    createdAt: row.createdAt,
  }));
}

export async function countUnreadNotifications(userId: string) {
  const db = getDb();
  if (!db) return 0;
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  return row?.count ?? 0;
}

export async function countUnreadConversations(
  userId: string,
  identity: InboxIdentity,
) {
  const previews = await listConversations({
    userId,
    identity,
    filter: "unread",
    limit: 99,
  });
  return previews.length;
}

export async function notifyJobPublished(input: {
  companyId: string;
  jobId: string;
  jobTitle: string;
  actorUserId: string;
}) {
  await notifyCompanyTeam(input.companyId, {
    type: "job",
    title: `Role published: ${input.jobTitle}`,
    body: "It is live on the RoleCall board.",
    href: `/dashboard/jobs/${input.jobId}`,
    excludeUserId: input.actorUserId,
  });
}

export async function notifyApplicationNote(input: {
  applicationId: string;
  companyId: string;
  candidateId: string;
  jobId: string;
  jobTitle: string;
  authorId: string;
  authorName: string;
  body: string;
}) {
  // Private hiring notes stay inside the company. Never post them into the
  // candidate thread or notify the candidate.
  void input.candidateId;
  void input.body;
  await notifyCompanyTeam(input.companyId, {
    type: "note",
    title: `Private note on ${input.jobTitle}`,
    body: `${input.authorName} left an internal hiring note.`,
    href: `/dashboard/jobs/${input.jobId}/pipeline`,
    excludeUserId: input.authorId,
  });
}

export async function getConversationIdForApplication(applicationId: string) {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(eq(conversations.applicationId, applicationId))
    .limit(1);
  return row?.id ?? null;
}

export async function notifyInviteAccepted(input: {
  companyId: string;
  companyName: string;
  memberName: string;
  memberUserId: string;
}) {
  await notifyCompanyTeam(input.companyId, {
    type: "team",
    title: `${input.memberName} joined ${input.companyName}`,
    body: "They accepted a team invite.",
    href: "/dashboard/team",
    excludeUserId: input.memberUserId,
  });
}

export async function notifyMemberRemoved(input: {
  userId: string | null;
  companyId: string;
  companyName: string;
}) {
  if (!input.userId) return;
  await createNotification({
    userId: input.userId,
    companyId: input.companyId,
    type: "team",
    title: `Removed from ${input.companyName}`,
    body: "Your seat on this company was removed.",
    href: "/dashboard",
  });
}

export async function notifyBadgeAwarded(input: {
  userId: string;
  badgeName: string;
  awardedByUserId: string;
}) {
  if (input.userId === input.awardedByUserId) return;
  await createNotification({
    userId: input.userId,
    type: "badge",
    title: `New badge: ${input.badgeName}`,
    body: "It was added to your RoleCall profile.",
    href: `/people/${input.userId}`,
  });
}

export async function markNotificationRead(notificationId: string, userId: string) {
  const db = requireDb();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(eq(notifications.id, notificationId), eq(notifications.userId, userId)),
    );
}

export async function markAllNotificationsRead(userId: string) {
  const db = requireDb();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
}

async function listHiringUserIds(companyId: string) {
  const db = requireDb();
  const rows = await db
    .select({ userId: companyMembers.userId })
    .from(companyMembers)
    .where(
      and(
        eq(companyMembers.companyId, companyId),
        eq(companyMembers.status, "active"),
        inArray(companyMembers.role, ["owner", "admin", "recruiter"]),
      ),
    );
  return rows
    .map((row) => row.userId)
    .filter((id): id is string => Boolean(id));
}

export async function openApplicationConversation(input: {
  applicationId: string;
  jobId: string;
  companyId: string;
  candidateId: string;
  coverLetter: string;
  jobTitle: string;
  companyName: string;
  candidateName: string;
}) {
  const db = requireDb();
  const existing = await db
    .select()
    .from(conversations)
    .where(eq(conversations.applicationId, input.applicationId))
    .limit(1);
  if (existing[0]) {
    return existing[0];
  }

  const [conversation] = await db
    .insert(conversations)
    .values({
      category: "applications",
      subject: `${input.jobTitle} at ${input.companyName}`,
      applicationId: input.applicationId,
      jobId: input.jobId,
      companyId: input.companyId,
      lastMessageAt: new Date(),
    })
    .returning();

  await db.insert(conversationParticipants).values([
    {
      conversationId: conversation.id,
      userId: input.candidateId,
      companyId: null,
    },
    {
      conversationId: conversation.id,
      userId: null,
      companyId: input.companyId,
    },
  ]);

  const body =
    input.coverLetter.trim() ||
    `${input.candidateName} applied for ${input.jobTitle}.`;

  await db.insert(messages).values({
    conversationId: conversation.id,
    senderUserId: input.candidateId,
    body,
  });

  const hiringUsers = await listHiringUserIds(input.companyId);
  for (const userId of hiringUsers) {
    if (userId === input.candidateId) continue;
    await createNotification({
      userId,
      companyId: input.companyId,
      type: "application",
      title: `New application for ${input.jobTitle}`,
      body: `${input.candidateName} applied.`,
      href: `/messages/${conversation.id}`,
    });
  }

  return conversation;
}

export async function syncConversationCategoryForApplication(
  applicationId: string,
  stage: ApplicationStage,
) {
  const db = getDb();
  if (!db) return;
  const category = stageToCategory(stage);
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.applicationId, applicationId))
    .limit(1);
  if (!conversation) return;

  await db
    .update(conversations)
    .set({ category })
    .where(eq(conversations.id, conversation.id));

  if (!conversation.jobId) return;

  const [job] = await db
    .select({ title: jobs.title, companyId: jobs.companyId })
    .from(jobs)
    .where(eq(jobs.id, conversation.jobId))
    .limit(1);

  const [application] = await db
    .select({ candidateId: applications.candidateId })
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);

  if (application?.candidateId && job) {
    await createNotification({
      userId: application.candidateId,
      companyId: job.companyId,
      type: "stage",
      title: `Application update: ${job.title}`,
      body: `Your application moved to ${stage}.`,
      href: `/messages/${conversation.id}`,
    });
  }
}

export async function notifyTeamInvite(input: {
  inviterUserId: string;
  companyId: string;
  companyName: string;
  email: string;
  inviteUrl: string;
}) {
  const db = requireDb();
  const [conversation] = await db
    .insert(conversations)
    .values({
      category: "team",
      subject: `Invite to ${input.companyName}`,
      companyId: input.companyId,
      lastMessageAt: new Date(),
    })
    .returning();

  await db.insert(conversationParticipants).values([
    {
      conversationId: conversation.id,
      userId: input.inviterUserId,
      companyId: null,
    },
    {
      conversationId: conversation.id,
      userId: null,
      companyId: input.companyId,
    },
  ]);

  await db.insert(messages).values({
    conversationId: conversation.id,
    senderUserId: input.inviterUserId,
    body: `Invite sent to ${input.email}. Share this link: ${input.inviteUrl}`,
  });

  await createNotification({
    userId: input.inviterUserId,
    companyId: input.companyId,
    type: "team",
    title: `Invite created for ${input.email}`,
    body: `They can join ${input.companyName} with the invite link.`,
    href: `/messages/${conversation.id}`,
  });
}

async function loadCounterpart(
  conversation: typeof conversations.$inferSelect,
  identity: InboxIdentity,
): Promise<{ name: string; image: string | null; subtitle: string | null }> {
  const db = requireDb();
  if (identity.kind === "company") {
    const [person] = await db
      .select({
        fullName: profiles.fullName,
        avatarUrl: profiles.avatarUrl,
        headline: profiles.headline,
      })
      .from(conversationParticipants)
      .innerJoin(profiles, eq(conversationParticipants.userId, profiles.id))
      .where(eq(conversationParticipants.conversationId, conversation.id))
      .limit(1);
    return {
      name: person?.fullName ?? "Candidate",
      image: person?.avatarUrl ?? null,
      subtitle: person?.headline ?? null,
    };
  }

  if (conversation.companyId) {
    const [company] = await db
      .select({
        name: companies.name,
        logoUrl: companies.logoUrl,
        tagline: companies.tagline,
      })
      .from(companies)
      .where(eq(companies.id, conversation.companyId))
      .limit(1);
    return {
      name: company?.name ?? "Company",
      image: company?.logoUrl ?? null,
      subtitle: company?.tagline ?? null,
    };
  }

  return { name: "Conversation", image: null, subtitle: null };
}

export async function listConversations(input: {
  userId: string;
  identity: InboxIdentity;
  filter?: ConversationFilter;
  limit?: number;
}): Promise<ConversationPreview[]> {
  const db = getDb();
  if (!db) return [];

  const filter = input.filter ?? "all";
  const limit = input.limit ?? 50;

  const participantWhere =
    input.identity.kind === "personal"
      ? eq(conversationParticipants.userId, input.userId)
      : eq(conversationParticipants.companyId, input.identity.companyId);

  const rows = await db
    .select({
      conversation: conversations,
      participant: conversationParticipants,
    })
    .from(conversationParticipants)
    .innerJoin(
      conversations,
      eq(conversationParticipants.conversationId, conversations.id),
    )
    .where(participantWhere)
    .orderBy(desc(conversations.lastMessageAt))
    .limit(200);

  const previews: ConversationPreview[] = [];

  for (const row of rows) {
    if (filter === "archive" && !row.participant.isArchived) continue;
    if (filter !== "archive" && row.participant.isArchived) continue;
    if (filter === "favorites" && !row.participant.isFavorite) continue;
    if (
      filter === "applications" ||
      filter === "interviews" ||
      filter === "offers" ||
      filter === "team" ||
      filter === "inquiries"
    ) {
      if (row.conversation.category !== filter) continue;
    }

    const [last] = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, row.conversation.id))
      .orderBy(desc(messages.createdAt))
      .limit(1);

    const unread =
      !row.participant.lastReadAt ||
      (last != null && last.createdAt > row.participant.lastReadAt);

    if (filter === "unread" && !unread) continue;

    const counterpart = await loadCounterpart(row.conversation, input.identity);

    previews.push({
      id: row.conversation.id,
      category: row.conversation.category,
      subject: row.conversation.subject,
      lastMessageAt: row.conversation.lastMessageAt,
      lastBody: last?.body ?? null,
      unread,
      isFavorite: row.participant.isFavorite,
      isArchived: row.participant.isArchived,
      counterpartName: counterpart.name,
      counterpartImage: counterpart.image,
      counterpartSubtitle: counterpart.subtitle,
    });

    if (previews.length >= limit) break;
  }

  return previews;
}

export async function getConversationForViewer(
  conversationId: string,
  userId: string,
  identity: InboxIdentity,
) {
  const db = getDb();
  if (!db) return null;

  const participantWhere =
    identity.kind === "personal"
      ? and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId),
        )
      : and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.companyId, identity.companyId),
        );

  const [row] = await db
    .select({
      conversation: conversations,
      participant: conversationParticipants,
    })
    .from(conversationParticipants)
    .innerJoin(
      conversations,
      eq(conversationParticipants.conversationId, conversations.id),
    )
    .where(participantWhere)
    .limit(1);

  return row ?? null;
}

export async function listMessages(
  conversationId: string,
): Promise<MessageRecord[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select({
      message: messages,
      senderName: profiles.fullName,
      senderAvatarUrl: profiles.avatarUrl,
    })
    .from(messages)
    .innerJoin(profiles, eq(messages.senderUserId, profiles.id))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);

  return rows.map((row) => ({
    id: row.message.id,
    conversationId: row.message.conversationId,
    senderUserId: row.message.senderUserId,
    body: row.message.body,
    createdAt: row.message.createdAt,
    senderName: row.senderName,
    senderAvatarUrl: row.senderAvatarUrl,
  }));
}

export async function sendMessage(input: {
  conversationId: string;
  senderUserId: string;
  body: string;
  identity: InboxIdentity;
}) {
  const db = requireDb();
  const access = await getConversationForViewer(
    input.conversationId,
    input.senderUserId,
    input.identity,
  );
  if (!access) {
    throw new Error("Conversation not found.");
  }

  const body = input.body.trim();
  if (!body) {
    throw new Error("Write a message first.");
  }

  const [created] = await db
    .insert(messages)
    .values({
      conversationId: input.conversationId,
      senderUserId: input.senderUserId,
      body,
    })
    .returning();

  await db
    .update(conversations)
    .set({ lastMessageAt: created.createdAt })
    .where(eq(conversations.id, input.conversationId));

  await db
    .update(conversationParticipants)
    .set({ lastReadAt: created.createdAt })
    .where(
      and(
        eq(conversationParticipants.conversationId, input.conversationId),
        input.identity.kind === "personal"
          ? eq(conversationParticipants.userId, input.senderUserId)
          : eq(conversationParticipants.companyId, input.identity.companyId),
      ),
    );

  const others = await db
    .select()
    .from(conversationParticipants)
    .where(eq(conversationParticipants.conversationId, input.conversationId));

  for (const other of others) {
    if (other.userId && other.userId !== input.senderUserId) {
      await createNotification({
        userId: other.userId,
        companyId: access.conversation.companyId,
        type: "message",
        title: "New message",
        body: body.slice(0, 140),
        href: `/messages/${input.conversationId}`,
      });
    }
    if (other.companyId && input.identity.kind === "personal") {
      const hiringUsers = await listHiringUserIds(other.companyId);
      for (const userId of hiringUsers) {
        if (userId === input.senderUserId) continue;
        await createNotification({
          userId,
          companyId: other.companyId,
          type: "message",
          title: "New company message",
          body: body.slice(0, 140),
          href: `/messages/${input.conversationId}`,
        });
      }
    }
  }

  return created;
}

export async function markConversationRead(
  conversationId: string,
  userId: string,
  identity: InboxIdentity,
) {
  const db = requireDb();
  await db
    .update(conversationParticipants)
    .set({ lastReadAt: new Date() })
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        identity.kind === "personal"
          ? eq(conversationParticipants.userId, userId)
          : eq(conversationParticipants.companyId, identity.companyId),
      ),
    );
}

export async function setConversationFlags(input: {
  conversationId: string;
  userId: string;
  identity: InboxIdentity;
  isFavorite?: boolean;
  isArchived?: boolean;
}) {
  const db = requireDb();
  const patch: { isFavorite?: boolean; isArchived?: boolean } = {};
  if (typeof input.isFavorite === "boolean") patch.isFavorite = input.isFavorite;
  if (typeof input.isArchived === "boolean") patch.isArchived = input.isArchived;

  await db
    .update(conversationParticipants)
    .set(patch)
    .where(
      and(
        eq(conversationParticipants.conversationId, input.conversationId),
        input.identity.kind === "personal"
          ? eq(conversationParticipants.userId, input.userId)
          : eq(conversationParticipants.companyId, input.identity.companyId),
      ),
    );
}

export async function listPublicPeople(
  limit = 24,
  query?: string,
): Promise<ProfileRecord[]> {
  const db = getDb();
  if (!db) return [];
  const needle = query?.trim().toLowerCase() ?? "";
  const rows = await db
    .select()
    .from(profiles)
    .where(
      and(
        eq(profiles.accountType, "candidate"),
        sql`${profiles.fullName} is not null`,
        sql`length(trim(${profiles.fullName})) > 0`,
      ),
    )
    .orderBy(desc(profiles.updatedAt))
    .limit(needle ? 120 : limit);

  const mapped = rows.map((row) => ({
    id: row.id,
    fullName: row.fullName,
    avatarUrl: row.avatarUrl,
    accountType: row.accountType,
    headline: row.headline,
    location: row.location,
    bio: row.bio,
    resumeUrl: row.resumeUrl,
    links: row.links ?? {},
    isPlatformAdmin: row.isPlatformAdmin,
  }));

  if (!needle) return mapped.slice(0, limit);
  return mapped
    .filter((person) =>
      [person.fullName ?? "", person.headline ?? "", person.location ?? "", person.bio ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    )
    .slice(0, limit);
}

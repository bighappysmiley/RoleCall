import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { getDb, requireDb } from "@/lib/db";
import {
  badges,
  companies,
  companyBadges,
  profileBadges,
  profiles,
} from "@/lib/db/schema";
import { uniqueSlug } from "@/lib/slug";
import type { AssignedBadge, BadgeRecord } from "@/lib/types";

function mapBadge(row: typeof badges.$inferSelect): BadgeRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    iconDataUrl: row.iconDataUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listBadges(): Promise<BadgeRecord[]> {
  const db = getDb();
  if (!db) {
    return [];
  }
  try {
    const rows = await db.select().from(badges).orderBy(asc(badges.name));
    return rows.map(mapBadge);
  } catch (error) {
    console.error("Failed to load badges.", error);
    return [];
  }
}

export async function getBadge(id: string): Promise<BadgeRecord | null> {
  const db = requireDb();
  const [row] = await db.select().from(badges).where(eq(badges.id, id)).limit(1);
  return row ? mapBadge(row) : null;
}

export async function createBadge(input: {
  name: string;
  description: string | null;
  iconDataUrl: string;
}): Promise<BadgeRecord> {
  const db = requireDb();
  const existing = await db.select({ slug: badges.slug }).from(badges);
  const slug = uniqueSlug(input.name, new Set(existing.map((row) => row.slug)));
  const [row] = await db
    .insert(badges)
    .values({
      slug,
      name: input.name,
      description: input.description,
      iconDataUrl: input.iconDataUrl,
    })
    .returning();
  if (!row) {
    throw new Error("Could not create badge.");
  }
  return mapBadge(row);
}

export async function updateBadge(
  id: string,
  input: {
    name: string;
    description: string | null;
    iconDataUrl?: string;
  },
): Promise<BadgeRecord> {
  const db = requireDb();
  const current = await getBadge(id);
  if (!current) {
    throw new Error("Badge not found.");
  }
  const existing = await db
    .select({ id: badges.id, slug: badges.slug })
    .from(badges);
  const slug =
    current.name === input.name
      ? current.slug
      : uniqueSlug(
          input.name,
          new Set(existing.filter((row) => row.id !== id).map((row) => row.slug)),
        );
  const [row] = await db
    .update(badges)
    .set({
      slug,
      name: input.name,
      description: input.description,
      ...(input.iconDataUrl ? { iconDataUrl: input.iconDataUrl } : {}),
      updatedAt: new Date(),
    })
    .where(eq(badges.id, id))
    .returning();
  if (!row) {
    throw new Error("Could not update badge.");
  }
  return mapBadge(row);
}

export async function deleteBadge(id: string) {
  const db = requireDb();
  await db.delete(badges).where(eq(badges.id, id));
}

export async function listProfileBadges(
  profileId: string,
): Promise<AssignedBadge[]> {
  const db = getDb();
  if (!db) {
    return [];
  }
  try {
    const rows = await db
      .select({ assignment: profileBadges, badge: badges })
      .from(profileBadges)
      .innerJoin(badges, eq(profileBadges.badgeId, badges.id))
      .where(eq(profileBadges.profileId, profileId))
      .orderBy(desc(profileBadges.isPinned), asc(badges.name));

    return rows.map((row) => ({
      ...mapBadge(row.badge),
      assignmentId: row.assignment.id,
      isPinned: row.assignment.isPinned,
    }));
  } catch (error) {
    console.error("Failed to load profile badges.", error);
    return [];
  }
}

export async function listCompanyBadges(
  companyId: string,
): Promise<AssignedBadge[]> {
  const db = getDb();
  if (!db) {
    return [];
  }
  try {
    const rows = await db
      .select({ assignment: companyBadges, badge: badges })
      .from(companyBadges)
      .innerJoin(badges, eq(companyBadges.badgeId, badges.id))
      .where(eq(companyBadges.companyId, companyId))
      .orderBy(desc(companyBadges.isPinned), asc(badges.name));

    return rows.map((row) => ({
      ...mapBadge(row.badge),
      assignmentId: row.assignment.id,
      isPinned: row.assignment.isPinned,
    }));
  } catch (error) {
    console.error("Failed to load company badges.", error);
    return [];
  }
}

export async function getPinnedCompanyBadgesByIds(companyIds: string[]) {
  const map = new Map<string, BadgeRecord>();
  if (companyIds.length === 0) {
    return map;
  }
  const db = getDb();
  if (!db) {
    return map;
  }
  try {
    const rows = await db
      .select({ companyId: companyBadges.companyId, badge: badges })
      .from(companyBadges)
      .innerJoin(badges, eq(companyBadges.badgeId, badges.id))
      .where(
        and(
          eq(companyBadges.isPinned, true),
          inArray(companyBadges.companyId, companyIds),
        ),
      );
    for (const row of rows) {
      map.set(row.companyId, mapBadge(row.badge));
    }
  } catch (error) {
    console.error("Failed to load pinned company badges.", error);
  }
  return map;
}

export async function withPinnedCompanyBadges<T extends { id: string }>(
  companies: T[],
): Promise<Array<T & { pinnedBadge: BadgeRecord | null }>> {
  const pinned = await getPinnedCompanyBadgesByIds(companies.map((c) => c.id));
  return companies.map((company) => ({
    ...company,
    pinnedBadge: pinned.get(company.id) ?? null,
  }));
}

export async function awardProfileBadge(input: {
  profileId: string;
  badgeId: string;
  awardedBy: string;
}) {
  const db = requireDb();
  const [profile] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.id, input.profileId))
    .limit(1);
  if (!profile) {
    throw new Error("Profile not found.");
  }
  await db
    .insert(profileBadges)
    .values({
      profileId: input.profileId,
      badgeId: input.badgeId,
      awardedBy: input.awardedBy,
    })
    .onConflictDoNothing({
      target: [profileBadges.profileId, profileBadges.badgeId],
    });
}

export async function awardCompanyBadge(input: {
  companyId: string;
  badgeId: string;
  awardedBy: string;
}) {
  const db = requireDb();
  const [company] = await db
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.id, input.companyId))
    .limit(1);
  if (!company) {
    throw new Error("Company not found.");
  }
  await db
    .insert(companyBadges)
    .values({
      companyId: input.companyId,
      badgeId: input.badgeId,
      awardedBy: input.awardedBy,
    })
    .onConflictDoNothing({
      target: [companyBadges.companyId, companyBadges.badgeId],
    });
}

export async function revokeProfileBadge(profileId: string, badgeId: string) {
  const db = requireDb();
  await db
    .delete(profileBadges)
    .where(
      and(
        eq(profileBadges.profileId, profileId),
        eq(profileBadges.badgeId, badgeId),
      ),
    );
}

export async function revokeCompanyBadge(companyId: string, badgeId: string) {
  const db = requireDb();
  await db
    .delete(companyBadges)
    .where(
      and(
        eq(companyBadges.companyId, companyId),
        eq(companyBadges.badgeId, badgeId),
      ),
    );
}

export async function pinProfileBadge(
  profileId: string,
  badgeId: string | null,
) {
  const db = requireDb();
  await db
    .update(profileBadges)
    .set({ isPinned: false })
    .where(eq(profileBadges.profileId, profileId));
  if (!badgeId) {
    return;
  }
  const [owned] = await db
    .select({ id: profileBadges.id })
    .from(profileBadges)
    .where(
      and(
        eq(profileBadges.profileId, profileId),
        eq(profileBadges.badgeId, badgeId),
      ),
    )
    .limit(1);
  if (!owned) {
    throw new Error("That badge is not on this profile.");
  }
  await db
    .update(profileBadges)
    .set({ isPinned: true })
    .where(eq(profileBadges.id, owned.id));
}

export async function pinCompanyBadge(
  companyId: string,
  badgeId: string | null,
) {
  const db = requireDb();
  await db
    .update(companyBadges)
    .set({ isPinned: false })
    .where(eq(companyBadges.companyId, companyId));
  if (!badgeId) {
    return;
  }
  const [owned] = await db
    .select({ id: companyBadges.id })
    .from(companyBadges)
    .where(
      and(
        eq(companyBadges.companyId, companyId),
        eq(companyBadges.badgeId, badgeId),
      ),
    )
    .limit(1);
  if (!owned) {
    throw new Error("That badge is not on this company.");
  }
  await db
    .update(companyBadges)
    .set({ isPinned: true })
    .where(eq(companyBadges.id, owned.id));
}

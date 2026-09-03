import { and, desc, eq, sql } from "drizzle-orm";
import { DEMO_COMPANIES, DEMO_JOBS, getDemoCompany, getDemoJob } from "@/lib/demo-data";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import {
  applications,
  companies,
  companyMembers,
  jobs,
  jobViews,
  profiles,
  savedJobs,
} from "@/lib/db/schema";
import { rankJobs } from "@/lib/ranking";
import type {
  AccountType,
  CompanyRecord,
  JobWithCompany,
  ProfileLinks,
  ProfileRecord,
  RankedJob,
} from "@/lib/types";

const PLATFORM_ADMIN_EMAIL = "hf@bighappysmiley.com";

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function mapCompany(row: typeof companies.$inferSelect): CompanyRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    logoUrl: row.logoUrl,
    website: row.website,
    industry: row.industry,
    sizeRange: row.sizeRange,
    foundedYear: row.foundedYear,
    locations: asStringArray(row.locations),
    techStack: row.techStack ?? [],
    benefits: asStringArray(row.benefits),
    socialLinks: row.socialLinks ?? {},
    isVerified: row.isVerified,
    subscriptionTier: row.subscriptionTier,
    overrideTier: row.overrideTier,
    overrideBoost: row.overrideBoost,
  };
}

function mapJob(
  job: typeof jobs.$inferSelect,
  company: CompanyRecord,
): JobWithCompany {
  return {
    id: job.id,
    companyId: job.companyId,
    title: job.title,
    slug: job.slug,
    description: job.description,
    responsibilities: job.responsibilities,
    requirements: job.requirements,
    department: job.department,
    employmentType: job.employmentType,
    workplaceType: job.workplaceType,
    location: job.location,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    salaryPeriod: job.salaryPeriod,
    showSalary: job.showSalary,
    skills: job.skills ?? [],
    experienceLevel: job.experienceLevel,
    status: job.status,
    publishedAt: job.publishedAt,
    closesAt: job.closesAt,
    promotionTier: job.promotionTier,
    promotedUntil: job.promotedUntil,
    promotionSpendCents: job.promotionSpendCents,
    viewCount: job.viewCount,
    applicationCount: job.applicationCount,
    company,
  };
}

function mapProfile(row: typeof profiles.$inferSelect): ProfileRecord {
  return {
    id: row.id,
    fullName: row.fullName,
    avatarUrl: row.avatarUrl,
    accountType: row.accountType,
    headline: row.headline,
    location: row.location,
    bio: row.bio,
    links: row.links ?? {},
    isPlatformAdmin: row.isPlatformAdmin,
  };
}

export function usingLiveDatabase(): boolean {
  return isDatabaseConfigured();
}

export async function listPublishedJobs(query?: string) {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(jobs)
        .innerJoin(companies, eq(jobs.companyId, companies.id))
        .where(eq(jobs.status, "published"));
      if (rows.length > 0) {
        return rankJobs(
          rows.map((row) => mapJob(row.jobs, mapCompany(row.companies))),
          query,
        );
      }
    } catch (error) {
      console.error("Failed to load jobs from Neon; using demo board.", error);
    }
  }
  return rankJobs(DEMO_JOBS, query);
}

export async function listCompanies(): Promise<CompanyRecord[]> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db.select().from(companies).orderBy(companies.name);
      if (rows.length > 0) {
        return rows.map(mapCompany);
      }
    } catch (error) {
      console.error("Failed to load companies from Neon; using demo data.", error);
    }
  }
  return DEMO_COMPANIES;
}

export async function getCompanyBySlug(
  slug: string,
): Promise<CompanyRecord | null> {
  const db = getDb();
  if (db) {
    try {
      const [row] = await db
        .select()
        .from(companies)
        .where(eq(companies.slug, slug))
        .limit(1);
      if (row) {
        return mapCompany(row);
      }
    } catch (error) {
      console.error("Failed to load company from Neon; using demo data.", error);
    }
  }
  return getDemoCompany(slug) ?? null;
}

export async function listCompanyJobs(companyId: string): Promise<RankedJob[]> {
  const all = await listPublishedJobs();
  return all.filter((job) => job.companyId === companyId);
}

export async function getJobBySlugs(
  companySlug: string,
  jobSlug: string,
): Promise<JobWithCompany | null> {
  const db = getDb();
  if (db) {
    try {
      const [row] = await db
        .select()
        .from(jobs)
        .innerJoin(companies, eq(jobs.companyId, companies.id))
        .where(
          and(eq(companies.slug, companySlug), eq(jobs.slug, jobSlug)),
        )
        .limit(1);
      if (row) {
        return mapJob(row.jobs, mapCompany(row.companies));
      }
    } catch (error) {
      console.error("Failed to load job from Neon; using demo data.", error);
    }
  }
  return getDemoJob(companySlug, jobSlug) ?? null;
}

export async function recordJobView(jobId: string, viewerId?: string) {
  const db = getDb();
  if (!db) {
    return;
  }
  try {
    await db.insert(jobViews).values({
      jobId,
      viewerId: viewerId ?? null,
    });
    await db
      .update(jobs)
      .set({ viewCount: sql`${jobs.viewCount} + 1` })
      .where(eq(jobs.id, jobId));
  } catch (error) {
    console.error("Failed to record job view.", error);
  }
}

export async function ensureProfile(user: {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}): Promise<ProfileRecord | null> {
  const db = getDb();
  if (!db) {
    return {
      id: user.id,
      fullName: user.name ?? null,
      avatarUrl: user.image ?? null,
      accountType: null,
      headline: null,
      location: null,
      bio: null,
      links: {},
      isPlatformAdmin: user.email?.toLowerCase() === PLATFORM_ADMIN_EMAIL,
    };
  }

  const [existing] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (existing) {
    return mapProfile(existing);
  }

  const [created] = await db
    .insert(profiles)
    .values({
      id: user.id,
      fullName: user.name ?? null,
      avatarUrl: user.image ?? null,
      isPlatformAdmin: user.email?.toLowerCase() === PLATFORM_ADMIN_EMAIL,
    })
    .returning();

  return created ? mapProfile(created) : null;
}

export async function getProfile(userId: string): Promise<ProfileRecord | null> {
  const db = getDb();
  if (!db) {
    return null;
  }
  const [row] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  return row ? mapProfile(row) : null;
}

export async function updateProfile(
  userId: string,
  input: {
    fullName: string;
    headline: string;
    location: string;
    bio: string;
    links: ProfileLinks;
  },
): Promise<ProfileRecord> {
  const db = getDb();
  if (!db) {
    throw new Error("Database is not connected.");
  }

  const [row] = await db
    .update(profiles)
    .set({
      fullName: input.fullName,
      headline: input.headline || null,
      location: input.location || null,
      bio: input.bio || null,
      links: input.links,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, userId))
    .returning();

  if (!row) {
    throw new Error("Profile not found.");
  }
  return mapProfile(row);
}

export async function setAccountType(
  userId: string,
  accountType: AccountType,
): Promise<void> {
  const db = getDb();
  if (!db) {
    throw new Error("Database is not connected.");
  }
  await db
    .update(profiles)
    .set({ accountType, updatedAt: new Date() })
    .where(eq(profiles.id, userId));
}

export async function isPlatformAdmin(userId: string): Promise<boolean> {
  const profile = await getProfile(userId);
  return profile?.isPlatformAdmin === true;
}

export async function listMemberships(userId: string) {
  const db = getDb();
  if (!db) {
    return [];
  }
  return db
    .select({
      id: companyMembers.id,
      role: companyMembers.role,
      status: companyMembers.status,
      company: companies,
    })
    .from(companyMembers)
    .innerJoin(companies, eq(companyMembers.companyId, companies.id))
    .where(
      and(eq(companyMembers.userId, userId), eq(companyMembers.status, "active")),
    );
}

export async function listCandidateApplications(userId: string) {
  const db = getDb();
  if (!db) {
    return [];
  }
  return db
    .select({
      id: applications.id,
      stage: applications.stage,
      createdAt: applications.createdAt,
      coverLetter: applications.coverLetter,
      job: jobs,
      company: companies,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .where(eq(applications.candidateId, userId))
    .orderBy(desc(applications.createdAt));
}

export async function getExistingApplication(jobId: string, candidateId: string) {
  const db = getDb();
  if (!db) {
    return null;
  }
  const [row] = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.jobId, jobId),
        eq(applications.candidateId, candidateId),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function applyToJob(input: {
  jobId: string;
  candidateId: string;
  coverLetter: string;
}) {
  const db = getDb();
  if (!db) {
    throw new Error("Database is not connected. Apply will work after Neon is seeded.");
  }

  const existing = await getExistingApplication(input.jobId, input.candidateId);
  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(applications)
    .values({
      jobId: input.jobId,
      candidateId: input.candidateId,
      coverLetter: input.coverLetter || null,
      source: "rolecall",
    })
    .returning();

  await db
    .update(jobs)
    .set({ applicationCount: sql`${jobs.applicationCount} + 1` })
    .where(eq(jobs.id, input.jobId));

  return created;
}

export async function isJobSaved(jobId: string, candidateId: string) {
  const db = getDb();
  if (!db) {
    return false;
  }
  const [row] = await db
    .select({ id: savedJobs.id })
    .from(savedJobs)
    .where(
      and(eq(savedJobs.jobId, jobId), eq(savedJobs.candidateId, candidateId)),
    )
    .limit(1);
  return Boolean(row);
}

export async function toggleSavedJob(jobId: string, candidateId: string) {
  const db = getDb();
  if (!db) {
    throw new Error("Database is not connected.");
  }
  const existing = await isJobSaved(jobId, candidateId);
  if (existing) {
    await db
      .delete(savedJobs)
      .where(
        and(eq(savedJobs.jobId, jobId), eq(savedJobs.candidateId, candidateId)),
      );
    return false;
  }
  await db.insert(savedJobs).values({ jobId, candidateId });
  return true;
}

export async function listSavedJobs(candidateId: string) {
  const db = getDb();
  if (!db) {
    return [];
  }
  const rows = await db
    .select()
    .from(savedJobs)
    .innerJoin(jobs, eq(savedJobs.jobId, jobs.id))
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .where(eq(savedJobs.candidateId, candidateId))
    .orderBy(desc(savedJobs.createdAt));
  return rows.map((row) => mapJob(row.jobs, mapCompany(row.companies)));
}

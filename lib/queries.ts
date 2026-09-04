import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb, isDatabaseConfigured, requireDb } from "@/lib/db";
import {
  applicationNotes,
  applications,
  companies,
  companyMembers,
  jobs,
  jobViews,
  profiles,
  savedJobs,
} from "@/lib/db/schema";
import { rankJobs } from "@/lib/ranking";
import { uniqueSlug } from "@/lib/slug";
import { requireUuid } from "@/lib/form";
import type {
  AccountType,
  ApplicationStage,
  CompanyRecord,
  EmploymentType,
  JobBoardFilters,
  JobStatus,
  JobWithCompany,
  MemberRole,
  ProfileLinks,
  ProfileRecord,
  RankedJob,
  WorkplaceType,
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
    stripeCustomerId: row.stripeCustomerId,
    stripeSubscriptionId: row.stripeSubscriptionId,
    subscriptionStatus: row.subscriptionStatus,
    currentPeriodEnd: row.currentPeriodEnd,
    adCreditBalanceCents: row.adCreditBalanceCents,
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

function applyBoardFilters(
  listed: RankedJob[],
  filters?: JobBoardFilters,
): RankedJob[] {
  return listed.filter((job) => {
    if (filters?.q?.trim()) {
      const terms = filters.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const haystack = [
        job.title,
        job.company.name,
        job.location ?? "",
        job.department ?? "",
        job.skills.join(" "),
        job.description,
      ]
        .join(" ")
        .toLowerCase();
      if (!terms.some((term) => haystack.includes(term))) {
        return false;
      }
    }
    if (filters?.type && job.employmentType !== filters.type) {
      return false;
    }
    if (filters?.workplace && job.workplaceType !== filters.workplace) {
      return false;
    }
    if (filters?.location) {
      const needle = filters.location.toLowerCase();
      const haystack = (job.location ?? "").toLowerCase();
      if (!haystack.includes(needle)) {
        return false;
      }
    }
    return true;
  });
}

export function usingLiveDatabase(): boolean {
  return isDatabaseConfigured();
}

export async function listPublishedJobs(filters?: JobBoardFilters) {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(jobs)
        .innerJoin(companies, eq(jobs.companyId, companies.id))
        .where(eq(jobs.status, "published"));
      return applyBoardFilters(
        rankJobs(
          rows.map((row) => mapJob(row.jobs, mapCompany(row.companies))),
          filters?.q,
        ),
        filters,
      );
    } catch (error) {
      console.error("Failed to load jobs from Neon.", error);
      return [];
    }
  }
  return [];
}

export async function listCompanies(): Promise<CompanyRecord[]> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db.select().from(companies).orderBy(companies.name);
      return rows.map(mapCompany);
    } catch (error) {
      console.error("Failed to load companies from Neon.", error);
      return [];
    }
  }
  return [];
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
      return row ? mapCompany(row) : null;
    } catch (error) {
      console.error("Failed to load company from Neon.", error);
      return null;
    }
  }
  return null;
}

export async function getCompanyById(id: string): Promise<CompanyRecord | null> {
  const db = getDb();
  if (!db) {
    return null;
  }
  const [row] = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return row ? mapCompany(row) : null;
}

export async function listCompanyJobs(companyId: string): Promise<RankedJob[]> {
  const all = await listPublishedJobs();
  return all.filter((job) => job.companyId === companyId);
}

async function viewerCanSeeUnpublished(
  viewerId: string | undefined,
  companyId: string,
): Promise<boolean> {
  if (!viewerId) {
    return false;
  }
  if (await isPlatformAdmin(viewerId)) {
    return true;
  }
  const membership = await getActiveMembership(viewerId, companyId);
  return Boolean(membership);
}

export async function getJobBySlugs(
  companySlug: string,
  jobSlug: string,
  viewerId?: string,
): Promise<JobWithCompany | null> {
  const db = getDb();
  if (db) {
    try {
      const [row] = await db
        .select()
        .from(jobs)
        .innerJoin(companies, eq(jobs.companyId, companies.id))
        .where(and(eq(companies.slug, companySlug), eq(jobs.slug, jobSlug)))
        .limit(1);
      if (!row) {
        return null;
      }
      const job = mapJob(row.jobs, mapCompany(row.companies));
      if (job.status === "published") {
        return job;
      }
      if (await viewerCanSeeUnpublished(viewerId, job.companyId)) {
        return job;
      }
      return null;
    } catch (error) {
      console.error("Failed to load job from Neon.", error);
      return null;
    }
  }
  return null;
}

export async function getJobById(jobId: string): Promise<JobWithCompany | null> {
  const db = getDb();
  if (!db) {
    return null;
  }
  const [row] = await db
    .select()
    .from(jobs)
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .where(eq(jobs.id, jobId))
    .limit(1);
  return row ? mapJob(row.jobs, mapCompany(row.companies)) : null;
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
  const db = requireDb();
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
  const db = requireDb();
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

export async function getActiveMembership(userId: string, companyId: string) {
  const db = getDb();
  if (!db) {
    return null;
  }
  const [row] = await db
    .select({
      id: companyMembers.id,
      role: companyMembers.role,
      status: companyMembers.status,
      company: companies,
    })
    .from(companyMembers)
    .innerJoin(companies, eq(companyMembers.companyId, companies.id))
    .where(
      and(
        eq(companyMembers.userId, userId),
        eq(companyMembers.companyId, companyId),
        eq(companyMembers.status, "active"),
      ),
    )
    .limit(1);
  return row ?? null;
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
      and(eq(applications.jobId, jobId), eq(applications.candidateId, candidateId)),
    )
    .limit(1);
  return row ?? null;
}

export async function applyToJob(input: {
  jobId: string;
  candidateId: string;
  coverLetter: string;
}) {
  const db = requireDb();
  const job = await getJobById(input.jobId);
  if (!job || job.status !== "published") {
    throw new Error("This role is not open for applications.");
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
  const db = requireDb();
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

export async function listCompanyJobRecords(companyId: string) {
  const db = requireDb();
  const company = await getCompanyById(companyId);
  if (!company) {
    return [];
  }
  const rows = await db
    .select()
    .from(jobs)
    .where(eq(jobs.companyId, companyId))
    .orderBy(desc(jobs.updatedAt));
  return rows.map((row) => mapJob(row, company));
}

export async function countPublishedJobs(companyId: string): Promise<number> {
  const db = requireDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(jobs)
    .where(and(eq(jobs.companyId, companyId), eq(jobs.status, "published")));
  return Number(row?.count ?? 0);
}

export async function countSeats(companyId: string): Promise<number> {
  const db = requireDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(companyMembers)
    .where(
      and(
        eq(companyMembers.companyId, companyId),
        inArray(companyMembers.status, ["active", "invited"]),
      ),
    );
  return Number(row?.count ?? 0);
}

export type CompanyWriteInput = {
  name: string;
  tagline: string | null;
  description: string | null;
  website: string | null;
  industry: string | null;
  sizeRange: string | null;
  foundedYear: number | null;
  locations: string[];
  techStack: string[];
  benefits: string[];
  socialLinks: CompanyRecord["socialLinks"];
};

async function takenCompanySlugs(exceptId?: string) {
  const db = requireDb();
  const rows = await db.select({ id: companies.id, slug: companies.slug }).from(companies);
  return new Set(
    rows.filter((row) => row.id !== exceptId).map((row) => row.slug),
  );
}

async function takenJobSlugs(companyId: string, exceptId?: string) {
  const db = requireDb();
  const rows = await db
    .select({ id: jobs.id, slug: jobs.slug })
    .from(jobs)
    .where(eq(jobs.companyId, companyId));
  return new Set(rows.filter((row) => row.id !== exceptId).map((row) => row.slug));
}

export async function createCompany(ownerId: string, input: CompanyWriteInput) {
  const db = requireDb();
  const slug = uniqueSlug(input.name, await takenCompanySlugs());
  const [company] = await db
    .insert(companies)
    .values({
      slug,
      name: input.name,
      tagline: input.tagline,
      description: input.description,
      website: input.website,
      industry: input.industry,
      sizeRange: input.sizeRange,
      foundedYear: input.foundedYear,
      locations: input.locations,
      techStack: input.techStack,
      benefits: input.benefits,
      socialLinks: input.socialLinks,
    })
    .returning();

  if (!company) {
    throw new Error("Could not create the company.");
  }

  await db.insert(companyMembers).values({
    companyId: company.id,
    userId: ownerId,
    role: "owner",
    status: "active",
  });

  return mapCompany(company);
}

export async function updateCompany(companyId: string, input: CompanyWriteInput) {
  const db = requireDb();
  const existing = await getCompanyById(companyId);
  if (!existing) {
    throw new Error("Company not found.");
  }
  const slug =
    existing.name === input.name
      ? existing.slug
      : uniqueSlug(input.name, await takenCompanySlugs(companyId));

  const [row] = await db
    .update(companies)
    .set({
      slug,
      name: input.name,
      tagline: input.tagline,
      description: input.description,
      website: input.website,
      industry: input.industry,
      sizeRange: input.sizeRange,
      foundedYear: input.foundedYear,
      locations: input.locations,
      techStack: input.techStack,
      benefits: input.benefits,
      socialLinks: input.socialLinks,
      updatedAt: new Date(),
    })
    .where(eq(companies.id, companyId))
    .returning();

  if (!row) {
    throw new Error("Company not found.");
  }
  return mapCompany(row);
}

export async function deleteCompany(companyId: string) {
  const id = requireUuid(companyId, "company");
  const db = requireDb();
  const [removed] = await db
    .delete(companies)
    .where(eq(companies.id, id))
    .returning({ id: companies.id });
  if (!removed) {
    throw new Error("Company not found.");
  }
}

export type JobWriteInput = {
  title: string;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  department: string | null;
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salaryPeriod: string;
  showSalary: boolean;
  skills: string[];
  experienceLevel: string | null;
  status: JobStatus;
};

export async function createJob(companyId: string, input: JobWriteInput) {
  const db = requireDb();
  const company = await getCompanyById(companyId);
  if (!company) {
    throw new Error("Company not found.");
  }
  const slug = uniqueSlug(input.title, await takenJobSlugs(companyId));
  const publishedAt = input.status === "published" ? new Date() : null;
  const [row] = await db
    .insert(jobs)
    .values({
      companyId,
      slug,
      title: input.title,
      description: input.description,
      responsibilities: input.responsibilities,
      requirements: input.requirements,
      department: input.department,
      employmentType: input.employmentType,
      workplaceType: input.workplaceType,
      location: input.location,
      salaryMin: input.salaryMin,
      salaryMax: input.salaryMax,
      salaryCurrency: input.salaryCurrency,
      salaryPeriod: input.salaryPeriod,
      showSalary: input.showSalary,
      skills: input.skills,
      experienceLevel: input.experienceLevel,
      status: input.status,
      publishedAt,
    })
    .returning();

  if (!row) {
    throw new Error("Could not create the job.");
  }
  return mapJob(row, company);
}

export async function updateJob(jobId: string, input: JobWriteInput) {
  const db = requireDb();
  const existing = await getJobById(jobId);
  if (!existing) {
    throw new Error("Job not found.");
  }
  const slug =
    existing.title === input.title
      ? existing.slug
      : uniqueSlug(input.title, await takenJobSlugs(existing.companyId, jobId));
  const becomingPublished =
    input.status === "published" && existing.status !== "published";
  const [row] = await db
    .update(jobs)
    .set({
      slug,
      title: input.title,
      description: input.description,
      responsibilities: input.responsibilities,
      requirements: input.requirements,
      department: input.department,
      employmentType: input.employmentType,
      workplaceType: input.workplaceType,
      location: input.location,
      salaryMin: input.salaryMin,
      salaryMax: input.salaryMax,
      salaryCurrency: input.salaryCurrency,
      salaryPeriod: input.salaryPeriod,
      showSalary: input.showSalary,
      skills: input.skills,
      experienceLevel: input.experienceLevel,
      status: input.status,
      publishedAt: becomingPublished
        ? new Date()
        : input.status === "published"
          ? existing.publishedAt
          : existing.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, jobId))
    .returning();

  if (!row) {
    throw new Error("Job not found.");
  }
  return mapJob(row, existing.company);
}

export async function deleteJob(jobId: string) {
  const id = requireUuid(jobId, "job");
  const db = requireDb();
  const [removed] = await db
    .delete(jobs)
    .where(eq(jobs.id, id))
    .returning({ id: jobs.id });
  if (!removed) {
    throw new Error("Job not found.");
  }
}

export async function listCompanyMembers(companyId: string) {
  const db = requireDb();
  return db
    .select({
      id: companyMembers.id,
      role: companyMembers.role,
      status: companyMembers.status,
      invitedEmail: companyMembers.invitedEmail,
      inviteToken: companyMembers.inviteToken,
      inviteExpiresAt: companyMembers.inviteExpiresAt,
      userId: companyMembers.userId,
      createdAt: companyMembers.createdAt,
      profile: profiles,
    })
    .from(companyMembers)
    .leftJoin(profiles, eq(companyMembers.userId, profiles.id))
    .where(
      and(
        eq(companyMembers.companyId, companyId),
        inArray(companyMembers.status, ["active", "invited"]),
      ),
    )
    .orderBy(companyMembers.createdAt);
}

export async function inviteCompanyMember(input: {
  companyId: string;
  email: string;
  role: Exclude<MemberRole, "owner">;
  token: string;
  expiresAt: Date;
}) {
  const db = requireDb();
  const email = input.email.toLowerCase();
  const existing = await listCompanyMembers(input.companyId);
  if (existing.some((row) => row.invitedEmail?.toLowerCase() === email)) {
    throw new Error("That email already has a seat or a pending invite.");
  }

  const [created] = await db
    .insert(companyMembers)
    .values({
      companyId: input.companyId,
      userId: null,
      role: input.role,
      status: "invited",
      invitedEmail: email,
      inviteToken: input.token,
      inviteExpiresAt: input.expiresAt,
    })
    .returning();

  if (!created) {
    throw new Error("Could not create the invite.");
  }
  return created;
}

export async function getInviteByToken(token: string) {
  const db = getDb();
  if (!db) {
    return null;
  }
  const [row] = await db
    .select({
      member: companyMembers,
      company: companies,
    })
    .from(companyMembers)
    .innerJoin(companies, eq(companyMembers.companyId, companies.id))
    .where(eq(companyMembers.inviteToken, token))
    .limit(1);
  return row ?? null;
}

export async function acceptInvite(input: {
  token: string;
  userId: string;
  email: string;
}) {
  const db = requireDb();
  const invite = await getInviteByToken(input.token);
  if (!invite || invite.member.status !== "invited") {
    throw new Error("This invite is not valid.");
  }
  if (
    invite.member.inviteExpiresAt &&
    invite.member.inviteExpiresAt.getTime() < Date.now()
  ) {
    throw new Error("This invite has expired. Ask for a new link.");
  }
  const invited = invite.member.invitedEmail?.toLowerCase();
  if (!invited || invited !== input.email.toLowerCase()) {
    throw new Error("Sign in with the email this invite was sent to.");
  }

  const [existingSeat] = await db
    .select()
    .from(companyMembers)
    .where(
      and(
        eq(companyMembers.companyId, invite.member.companyId),
        eq(companyMembers.userId, input.userId),
      ),
    )
    .limit(1);

  if (existingSeat && existingSeat.id !== invite.member.id) {
    const [updated] = await db
      .update(companyMembers)
      .set({
        status: "active",
        role: existingSeat.role === "owner" ? "owner" : invite.member.role,
        inviteToken: null,
        inviteExpiresAt: null,
      })
      .where(eq(companyMembers.id, existingSeat.id))
      .returning();
    await db.delete(companyMembers).where(eq(companyMembers.id, invite.member.id));
    return { member: updated, company: mapCompany(invite.company) };
  }

  const [updated] = await db
    .update(companyMembers)
    .set({
      userId: input.userId,
      status: "active",
      inviteToken: null,
      inviteExpiresAt: null,
    })
    .where(eq(companyMembers.id, invite.member.id))
    .returning();

  return { member: updated, company: mapCompany(invite.company) };
}

export async function removeCompanyMember(memberId: string, companyId: string) {
  const db = requireDb();
  const [row] = await db
    .select()
    .from(companyMembers)
    .where(and(eq(companyMembers.id, memberId), eq(companyMembers.companyId, companyId)))
    .limit(1);
  if (!row) {
    throw new Error("Seat not found.");
  }
  if (row.role === "owner") {
    throw new Error("The owner seat cannot be removed.");
  }
  await db
    .update(companyMembers)
    .set({ status: "removed", inviteToken: null })
    .where(eq(companyMembers.id, memberId));
}

export async function listJobApplications(jobId: string) {
  const db = requireDb();
  return db
    .select({
      application: applications,
      candidate: profiles,
    })
    .from(applications)
    .innerJoin(profiles, eq(applications.candidateId, profiles.id))
    .where(eq(applications.jobId, jobId))
    .orderBy(applications.stage, applications.createdAt);
}

export async function getApplicationForCompany(applicationId: string) {
  const db = requireDb();
  const [row] = await db
    .select({
      application: applications,
      candidate: profiles,
      job: jobs,
      company: companies,
    })
    .from(applications)
    .innerJoin(profiles, eq(applications.candidateId, profiles.id))
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .where(eq(applications.id, applicationId))
    .limit(1);
  return row ?? null;
}

export async function updateApplicationStage(
  applicationId: string,
  stage: ApplicationStage,
) {
  const db = requireDb();
  const [row] = await db
    .update(applications)
    .set({ stage })
    .where(eq(applications.id, applicationId))
    .returning();
  if (!row) {
    throw new Error("Application not found.");
  }
  return row;
}

export async function listApplicationNotes(applicationId: string) {
  const db = requireDb();
  return db
    .select({
      note: applicationNotes,
      author: profiles,
    })
    .from(applicationNotes)
    .innerJoin(profiles, eq(applicationNotes.authorId, profiles.id))
    .where(eq(applicationNotes.applicationId, applicationId))
    .orderBy(desc(applicationNotes.createdAt));
}

export async function addApplicationNote(input: {
  applicationId: string;
  authorId: string;
  body: string;
}) {
  const db = requireDb();
  const [row] = await db
    .insert(applicationNotes)
    .values({
      applicationId: input.applicationId,
      authorId: input.authorId,
      body: input.body,
    })
    .returning();
  if (!row) {
    throw new Error("Could not save the note.");
  }
  return row;
}

export async function listJobPipeline(jobId: string) {
  const apps = await listJobApplications(jobId);
  if (apps.length === 0) {
    return [];
  }
  const db = requireDb();
  const notes = await db
    .select({
      note: applicationNotes,
      author: profiles,
    })
    .from(applicationNotes)
    .innerJoin(profiles, eq(applicationNotes.authorId, profiles.id))
    .where(
      inArray(
        applicationNotes.applicationId,
        apps.map((row) => row.application.id),
      ),
    )
    .orderBy(desc(applicationNotes.createdAt));

  const notesByApp = new Map<string, typeof notes>();
  for (const row of notes) {
    const list = notesByApp.get(row.note.applicationId) ?? [];
    list.push(row);
    notesByApp.set(row.note.applicationId, list);
  }

  return apps.map((row) => ({
    ...row,
    notes: notesByApp.get(row.application.id) ?? [],
  }));
}

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { DEMO_COMPANIES, DEMO_JOB_ROWS } from "../lib/demo-data";
import { companies, jobs } from "../lib/db/schema";

config({ path: ".env.local" });

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is missing. Copy .env.example to .env.local first.");
  }

  const db = drizzle(neon(url));

  await db
    .insert(companies)
    .values(
      DEMO_COMPANIES.map((company) => ({
        id: company.id,
        slug: company.slug,
        name: company.name,
        tagline: company.tagline,
        description: company.description,
        logoUrl: company.logoUrl,
        website: company.website,
        industry: company.industry,
        sizeRange: company.sizeRange,
        foundedYear: company.foundedYear,
        locations: company.locations,
        techStack: company.techStack,
        benefits: company.benefits,
        socialLinks: company.socialLinks,
        isVerified: company.isVerified,
        subscriptionTier: company.subscriptionTier,
        overrideTier: company.overrideTier,
        overrideBoost: company.overrideBoost,
      })),
    )
    .onConflictDoNothing({ target: companies.id });

  await db
    .insert(jobs)
    .values(
      DEMO_JOB_ROWS.map((job) => ({
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
        skills: job.skills,
        experienceLevel: job.experienceLevel,
        status: job.status,
        publishedAt: job.publishedAt,
        closesAt: job.closesAt,
        promotionTier: job.promotionTier,
        promotedUntil: job.promotedUntil,
        promotionSpendCents: job.promotionSpendCents,
        viewCount: job.viewCount,
        applicationCount: job.applicationCount,
      })),
    )
    .onConflictDoNothing({ target: jobs.id });

  console.log("Seeded 3 companies and 12 jobs.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

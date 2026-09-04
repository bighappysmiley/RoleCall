/**
 * Idempotent seed for RoleCall Phase 1.
 * Ensures BigHappySmiley admin company + three sample employers and 12 jobs.
 *
 * Run: npm run db:seed
 */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Seeding RoleCall…");

  // Ensure platform admin profile placeholder exists only if user already signed up.
  // Sample companies / jobs are public demo data (no auth users required).

  await sql`
    INSERT INTO companies (
      slug, name, tagline, description, industry, size_range, locations, tech_stack,
      subscription_tier, override_tier, override_boost, is_verified
    )
    VALUES
      (
        'bighappysmiley',
        'BigHappySmiley',
        'Platform operator',
        'Operator of RoleCall. Seeded with enterprise overrides for demos.',
        'Software',
        '11-50',
        '["Remote"]'::jsonb,
        ARRAY['TypeScript','Postgres'],
        'free',
        'enterprise',
        true,
        true
      ),
      (
        'northwind-labs',
        'Northwind Labs',
        'Climate instrumentation',
        'Hardware and firmware for field sensors.',
        'Climate tech',
        '51-200',
        '["Portland, OR","Remote"]'::jsonb,
        ARRAY['Rust','Python','C'],
        'pro_plus',
        NULL,
        false,
        true
      ),
      (
        'harbor-and-co',
        'Harbor & Co',
        'Logistics clarity',
        'Operations software for regional carriers.',
        'Logistics',
        '11-50',
        '["Chicago, IL"]'::jsonb,
        ARRAY['Go','React'],
        'pro',
        NULL,
        false,
        false
      ),
      (
        'cedar-press',
        'Cedar Press',
        'Independent publishing tools',
        'Editorial workflow for small presses.',
        'Media',
        '1-10',
        '["Remote"]'::jsonb,
        ARRAY['TypeScript'],
        'free',
        NULL,
        false,
        false
      )
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      tagline = EXCLUDED.tagline,
      description = EXCLUDED.description,
      updated_at = now()
  `;

  const companyRows = await sql`SELECT id, slug FROM companies`;
  const bySlug = Object.fromEntries(
    companyRows.map((r: { id: string; slug: string }) => [r.slug, r.id])
  );

  const jobSeed: Array<{
    company: string;
    title: string;
    slug: string;
    description: string;
    employment: string;
    workplace: string;
    location: string;
    salaryMin: number;
    salaryMax: number;
    skills: string[];
    experience: string;
  }> = [
    {
      company: "northwind-labs",
      title: "Firmware Engineer",
      slug: "firmware-engineer",
      description: "Ship reliable sensor firmware for harsh environments.",
      employment: "full_time",
      workplace: "hybrid",
      location: "Portland, OR",
      salaryMin: 140000,
      salaryMax: 175000,
      skills: ["C", "RTOS", "Hardware"],
      experience: "mid",
    },
    {
      company: "northwind-labs",
      title: "Data Scientist",
      slug: "data-scientist",
      description: "Model climate time series from field deployments.",
      employment: "full_time",
      workplace: "remote",
      location: "Remote",
      salaryMin: 150000,
      salaryMax: 185000,
      skills: ["Python", "Pandas", "Stats"],
      experience: "senior",
    },
    {
      company: "northwind-labs",
      title: "Product Designer",
      slug: "product-designer",
      description: "Design field technician tools that work offline.",
      employment: "full_time",
      workplace: "remote",
      location: "Remote",
      salaryMin: 125000,
      salaryMax: 155000,
      skills: ["Figma", "Research"],
      experience: "mid",
    },
    {
      company: "northwind-labs",
      title: "Solutions Engineer",
      slug: "solutions-engineer",
      description: "Help partners deploy sensor networks.",
      employment: "full_time",
      workplace: "onsite",
      location: "Portland, OR",
      salaryMin: 120000,
      salaryMax: 145000,
      skills: ["Customer success", "Networking"],
      experience: "mid",
    },
    {
      company: "harbor-and-co",
      title: "Backend Engineer",
      slug: "backend-engineer",
      description: "Build APIs for shipment visibility.",
      employment: "full_time",
      workplace: "hybrid",
      location: "Chicago, IL",
      salaryMin: 135000,
      salaryMax: 165000,
      skills: ["Go", "Postgres"],
      experience: "mid",
    },
    {
      company: "harbor-and-co",
      title: "Ops Analyst",
      slug: "ops-analyst",
      description: "Turn carrier data into weekly action.",
      employment: "full_time",
      workplace: "onsite",
      location: "Chicago, IL",
      salaryMin: 85000,
      salaryMax: 105000,
      skills: ["SQL", "Spreadsheets"],
      experience: "junior",
    },
    {
      company: "harbor-and-co",
      title: "Frontend Engineer",
      slug: "frontend-engineer",
      description: "Ship dispatch UI used every morning.",
      employment: "full_time",
      workplace: "remote",
      location: "Remote",
      salaryMin: 130000,
      salaryMax: 160000,
      skills: ["React", "TypeScript"],
      experience: "mid",
    },
    {
      company: "harbor-and-co",
      title: "Customer Support Lead",
      slug: "customer-support-lead",
      description: "Own onboarding for regional fleets.",
      employment: "full_time",
      workplace: "hybrid",
      location: "Chicago, IL",
      salaryMin: 90000,
      salaryMax: 110000,
      skills: ["Support", "Training"],
      experience: "mid",
    },
    {
      company: "cedar-press",
      title: "Full-stack Engineer",
      slug: "full-stack-engineer",
      description: "Build editorial tools for independent presses.",
      employment: "full_time",
      workplace: "remote",
      location: "Remote",
      salaryMin: 115000,
      salaryMax: 140000,
      skills: ["TypeScript", "Next.js"],
      experience: "mid",
    },
    {
      company: "cedar-press",
      title: "Editorial Producer",
      slug: "editorial-producer",
      description: "Coordinate seasonal catalogs.",
      employment: "contract",
      workplace: "remote",
      location: "Remote",
      salaryMin: 70000,
      salaryMax: 90000,
      skills: ["Editing", "Project management"],
      experience: "mid",
    },
    {
      company: "bighappysmiley",
      title: "Platform Engineer",
      slug: "platform-engineer",
      description: "Keep RoleCall reliable for every tenant.",
      employment: "full_time",
      workplace: "remote",
      location: "Remote",
      salaryMin: 160000,
      salaryMax: 200000,
      skills: ["TypeScript", "Postgres", "Neon"],
      experience: "senior",
    },
    {
      company: "bighappysmiley",
      title: "Developer Advocate Intern",
      slug: "developer-advocate-intern",
      description: "Write guides and sample apps for RoleCall.",
      employment: "internship",
      workplace: "remote",
      location: "Remote",
      salaryMin: 30,
      salaryMax: 40,
      skills: ["Writing", "Demos"],
      experience: "junior",
    },
  ];

  for (const j of jobSeed) {
    const companyId = bySlug[j.company];
    if (!companyId) continue;
    await sql`
      INSERT INTO jobs (
        company_id, title, slug, description, employment_type, workplace_type,
        location, salary_min, salary_max, salary_currency, salary_period,
        show_salary, skills, experience_level, status, published_at
      )
      VALUES (
        ${companyId},
        ${j.title},
        ${j.slug},
        ${j.description},
        ${j.employment}::employment_type,
        ${j.workplace}::workplace_type,
        ${j.location},
        ${j.salaryMin},
        ${j.salaryMax},
        'USD',
        ${j.company === "bighappysmiley" && j.slug === "developer-advocate-intern" ? "hour" : "year"},
        true,
        ${j.skills},
        ${j.experience},
        'published',
        now() - (${Math.floor(Math.random() * 14)} || ' days')::interval
      )
      ON CONFLICT (company_id, slug) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        status = 'published',
        updated_at = now()
    `;
  }

  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

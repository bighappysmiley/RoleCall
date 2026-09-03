import type { CompanyRecord, JobRecord, JobWithCompany } from "@/lib/types";

const BHS_ID = "11111111-1111-4111-8111-111111111111";
const NORTHWIND_ID = "22222222-2222-4222-8222-222222222222";
const HARBOR_ID = "33333333-3333-4333-8333-333333333333";

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 86_400_000);
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 86_400_000);
}

export const DEMO_COMPANIES: CompanyRecord[] = [
  {
    id: BHS_ID,
    slug: "bighappysmiley",
    name: "BigHappySmiley",
    tagline: "Tools that treat operators like people.",
    description:
      "BigHappySmiley builds calm, practical software for shops, crews, and hiring teams. RoleCall is our hiring board: dense, typographic, and honest about who paid for placement.",
    logoUrl: null,
    website: "https://bighappysmiley.com",
    industry: "Software",
    sizeRange: "11-50",
    foundedYear: 2024,
    locations: ["Remote", "Austin, TX"],
    techStack: ["TypeScript", "Next.js", "Postgres", "Neon"],
    benefits: [
      "Remote-first",
      "Health stipend",
      "Learning budget",
      "No on-call theater",
    ],
    socialLinks: { linkedin: "https://linkedin.com/company/bighappysmiley" },
    isVerified: true,
    subscriptionTier: "free",
    overrideTier: "enterprise",
    overrideBoost: true,
  },
  {
    id: NORTHWIND_ID,
    slug: "northwind-labs",
    name: "Northwind Labs",
    tagline: "Industrial software with a human interface.",
    description:
      "Northwind Labs designs control software for warehouses, mills, and field crews. We hire people who can sit with a messy process and leave it clearer.",
    logoUrl: null,
    website: "https://northwindlabs.example",
    industry: "Industrial software",
    sizeRange: "51-200",
    foundedYear: 2018,
    locations: ["Chicago, IL", "Remote"],
    techStack: ["Go", "TypeScript", "Postgres", "MQTT"],
    benefits: ["Hybrid Chicago hub", "401(k) match", "Parental leave", "Hardware budget"],
    socialLinks: {},
    isVerified: true,
    subscriptionTier: "pro_plus",
    overrideTier: null,
    overrideBoost: false,
  },
  {
    id: HARBOR_ID,
    slug: "harbor-and-co",
    name: "Harbor & Co",
    tagline: "Freight that shows up when it said it would.",
    description:
      "Harbor & Co runs regional freight and last-mile for independent grocers and makers. We are hiring operators who like radios, spreadsheets, and getting trucks out on time.",
    logoUrl: null,
    website: "https://harborandco.example",
    industry: "Logistics",
    sizeRange: "201-500",
    foundedYear: 2012,
    locations: ["Savannah, GA", "Charleston, SC"],
    techStack: ["Ruby", "Postgres", "React", "Redis"],
    benefits: ["On-site meals", "Union-friendly", "Shift differentials", "Transit pass"],
    socialLinks: {},
    isVerified: false,
    subscriptionTier: "pro",
    overrideTier: null,
    overrideBoost: false,
  },
];

const JOBS: JobRecord[] = [
  {
    id: "a1111111-1111-4111-8111-111111111101",
    companyId: BHS_ID,
    title: "Founding Product Engineer",
    slug: "founding-product-engineer",
    description:
      "You will ship RoleCall with a very small team. Expect to own a vertical — auth, the job board, billing — and talk to the first employers using it.",
    responsibilities:
      "Design and ship product surfaces in Next.js.\nKeep the data model honest.\nSit with customers when something is confusing.",
    requirements:
      "Shipped production TypeScript.\nComfortable with Postgres.\nWilling to write and rewrite copy.",
    department: "Product",
    employmentType: "full_time",
    workplaceType: "remote",
    location: "Remote (US)",
    salaryMin: 14000000,
    salaryMax: 17500000,
    salaryCurrency: "USD",
    salaryPeriod: "year",
    showSalary: true,
    skills: ["TypeScript", "Next.js", "Postgres", "Product sense"],
    experienceLevel: "senior",
    status: "published",
    publishedAt: daysAgo(2),
    closesAt: null,
    promotionTier: "tier",
    promotedUntil: null,
    promotionSpendCents: 0,
    viewCount: 412,
    applicationCount: 18,
  },
  {
    id: "a1111111-1111-4111-8111-111111111102",
    companyId: BHS_ID,
    title: "Designer who writes",
    slug: "designer-who-writes",
    description:
      "RoleCall should read like a trade directory, not a startup landing page. You will set type, spacing, and the words on the rails.",
    responsibilities:
      "Own the public board and company profiles.\nWrite interface copy.\nPrototype in code when that is faster than Figma.",
    requirements:
      "A portfolio with information-dense products.\nComfortable in Figma and in a codebase.\nStrong opinions, loosely held, about type.",
    department: "Design",
    employmentType: "full_time",
    workplaceType: "remote",
    location: "Remote (US)",
    salaryMin: 12500000,
    salaryMax: 15500000,
    salaryCurrency: "USD",
    salaryPeriod: "year",
    showSalary: true,
    skills: ["Product design", "Typography", "Figma", "CSS"],
    experienceLevel: "mid",
    status: "published",
    publishedAt: daysAgo(5),
    closesAt: null,
    promotionTier: "none",
    promotedUntil: null,
    promotionSpendCents: 0,
    viewCount: 288,
    applicationCount: 11,
  },
  {
    id: "a1111111-1111-4111-8111-111111111103",
    companyId: BHS_ID,
    title: "Customer operator",
    slug: "customer-operator",
    description:
      "The first fifty companies on RoleCall need a human. You will onboard them, file the bugs they hit, and keep the board honest.",
    responsibilities:
      "Run onboarding calls.\nTriage support.\nWrite the help articles we are missing.",
    requirements:
      "Have supported a B2B product.\nClear writing.\nPatience with people who are hiring under pressure.",
    department: "Operations",
    employmentType: "full_time",
    workplaceType: "hybrid",
    location: "Austin, TX",
    salaryMin: 8500000,
    salaryMax: 10500000,
    salaryCurrency: "USD",
    salaryPeriod: "year",
    showSalary: true,
    skills: ["Support", "Writing", "SQL basics"],
    experienceLevel: "mid",
    status: "published",
    publishedAt: daysAgo(8),
    closesAt: null,
    promotionTier: "none",
    promotedUntil: null,
    promotionSpendCents: 0,
    viewCount: 190,
    applicationCount: 7,
  },
  {
    id: "a1111111-1111-4111-8111-111111111104",
    companyId: BHS_ID,
    title: "Payments intern",
    slug: "payments-intern",
    description:
      "Help wire Stripe test mode, credit packs, and the promotion expiry job. This is a real intern seat, not coffee runs.",
    responsibilities:
      "Pair on Checkout and webhooks.\nWrite fixtures.\nDocument the money paths in cents.",
    requirements:
      "Coursework or side projects in web development.\nCuriosity about billing.\nUS work authorization for an internship.",
    department: "Engineering",
    employmentType: "internship",
    workplaceType: "remote",
    location: "Remote (US)",
    salaryMin: 280000,
    salaryMax: 320000,
    salaryCurrency: "USD",
    salaryPeriod: "month",
    showSalary: true,
    skills: ["TypeScript", "Stripe", "Testing"],
    experienceLevel: "intern",
    status: "published",
    publishedAt: daysAgo(1),
    closesAt: daysFromNow(30),
    promotionTier: "none",
    promotedUntil: null,
    promotionSpendCents: 0,
    viewCount: 96,
    applicationCount: 22,
  },
  {
    id: "a2222222-2222-4222-8222-222222222201",
    companyId: NORTHWIND_ID,
    title: "Controls engineer",
    slug: "controls-engineer",
    description:
      "Own the loop between PLC telemetry and the Northwind dashboard. You will spend time on mill floors and in Go services.",
    responsibilities:
      "Ingest MQTT streams.\nDebug latency with operators.\nKeep the historian honest.",
    requirements:
      "Industrial or IoT background.\nGo or similar.\nWilling to travel quarterly.",
    department: "Engineering",
    employmentType: "full_time",
    workplaceType: "hybrid",
    location: "Chicago, IL",
    salaryMin: 13000000,
    salaryMax: 16000000,
    salaryCurrency: "USD",
    salaryPeriod: "year",
    showSalary: true,
    skills: ["Go", "MQTT", "Postgres", "Industrial systems"],
    experienceLevel: "senior",
    status: "published",
    publishedAt: daysAgo(3),
    closesAt: null,
    promotionTier: "tier",
    promotedUntil: null,
    promotionSpendCents: 0,
    viewCount: 340,
    applicationCount: 9,
  },
  {
    id: "a2222222-2222-4222-8222-222222222202",
    companyId: NORTHWIND_ID,
    title: "Field success lead",
    slug: "field-success-lead",
    description:
      "Stand up Northwind at new sites. You will train supervisors, write runbooks, and bring product feedback home.",
    responsibilities:
      "Plan go-lives.\nTrain shift leads.\nFile crisp tickets.",
    requirements:
      "Have launched software in a physical workplace.\nTravel-ready.\nCalm under a loud floor.",
    department: "Customer success",
    employmentType: "full_time",
    workplaceType: "hybrid",
    location: "Chicago, IL",
    salaryMin: 11000000,
    salaryMax: 13500000,
    salaryCurrency: "USD",
    salaryPeriod: "year",
    showSalary: true,
    skills: ["Implementation", "Training", "Operations"],
    experienceLevel: "mid",
    status: "published",
    publishedAt: daysAgo(6),
    closesAt: null,
    promotionTier: "none",
    promotedUntil: null,
    promotionSpendCents: 0,
    viewCount: 210,
    applicationCount: 14,
  },
  {
    id: "a2222222-2222-4222-8222-222222222203",
    companyId: NORTHWIND_ID,
    title: "Frontend engineer",
    slug: "frontend-engineer",
    description:
      "The plant UI has to work with gloves and bad lighting. You will make dense screens that still scan.",
    responsibilities:
      "Build React views for live equipment.\nObsess over keyboard and contrast.\nPartner with design twice a week.",
    requirements:
      "Production React.\nRespect for accessibility.\nInterest in industrial UX.",
    department: "Engineering",
    employmentType: "full_time",
    workplaceType: "remote",
    location: "Remote (US)",
    salaryMin: 12000000,
    salaryMax: 15000000,
    salaryCurrency: "USD",
    salaryPeriod: "year",
    showSalary: true,
    skills: ["TypeScript", "React", "CSS", "a11y"],
    experienceLevel: "mid",
    status: "published",
    publishedAt: daysAgo(4),
    closesAt: null,
    promotionTier: "none",
    promotedUntil: null,
    promotionSpendCents: 0,
    viewCount: 265,
    applicationCount: 16,
  },
  {
    id: "a2222222-2222-4222-8222-222222222204",
    companyId: NORTHWIND_ID,
    title: "Data contractor",
    slug: "data-contractor",
    description:
      "Six-month contract to model mill events and ship the first reliability dashboards.",
    responsibilities:
      "Design event schemas.\nWrite transformation jobs.\nDocument grain and late data.",
    requirements:
      "Analytics engineering or similar.\nSQL as a first language.\nComfortable with messy timestamps.",
    department: "Data",
    employmentType: "contract",
    workplaceType: "remote",
    location: "Remote",
    salaryMin: 9000000,
    salaryMax: 11000000,
    salaryCurrency: "USD",
    salaryPeriod: "year",
    showSalary: false,
    skills: ["SQL", "dbt", "Postgres"],
    experienceLevel: "senior",
    status: "published",
    publishedAt: daysAgo(12),
    closesAt: daysFromNow(21),
    promotionTier: "none",
    promotedUntil: null,
    promotionSpendCents: 0,
    viewCount: 154,
    applicationCount: 5,
  },
  {
    id: "a3333333-3333-4333-8333-333333333301",
    companyId: HARBOR_ID,
    title: "Night dispatcher",
    slug: "night-dispatcher",
    description:
      "Own the overnight board for Savannah and Charleston. You will keep trailers moving when the phones get quiet and the exceptions get loud.",
    responsibilities:
      "Cover 7pm–5am.\nReroute around weather and breakdowns.\nHand a clean board to mornings.",
    requirements:
      "Dispatch or logistics experience.\nClear radio voice.\nNights are a feature, not a bug.",
    department: "Operations",
    employmentType: "full_time",
    workplaceType: "onsite",
    location: "Savannah, GA",
    salaryMin: 6200000,
    salaryMax: 7400000,
    salaryCurrency: "USD",
    salaryPeriod: "year",
    showSalary: true,
    skills: ["Dispatch", "Logistics", "Excel"],
    experienceLevel: "mid",
    status: "published",
    publishedAt: daysAgo(1),
    closesAt: null,
    promotionTier: "credits",
    promotedUntil: daysFromNow(10),
    promotionSpendCents: 2500,
    viewCount: 178,
    applicationCount: 6,
  },
  {
    id: "a3333333-3333-4333-8333-333333333302",
    companyId: HARBOR_ID,
    title: "Fleet mechanic",
    slug: "fleet-mechanic",
    description:
      "Keep the regional fleet legal and rolling. Diesel, reefers, and the occasional mystery leak.",
    responsibilities:
      "Preventive maintenance.\nDOT inspections.\nParts calls that do not waste a day.",
    requirements:
      "CDL not required. Diesel experience is.\nOwn tools welcome, shop stocked.\nAble to lift 50 lbs.",
    department: "Maintenance",
    employmentType: "full_time",
    workplaceType: "onsite",
    location: "Charleston, SC",
    salaryMin: 6800000,
    salaryMax: 8200000,
    salaryCurrency: "USD",
    salaryPeriod: "year",
    showSalary: true,
    skills: ["Diesel", "DOT", "Hydraulics"],
    experienceLevel: "mid",
    status: "published",
    publishedAt: daysAgo(7),
    closesAt: null,
    promotionTier: "none",
    promotedUntil: null,
    promotionSpendCents: 0,
    viewCount: 121,
    applicationCount: 4,
  },
  {
    id: "a3333333-3333-4333-8333-333333333303",
    companyId: HARBOR_ID,
    title: "Account manager, independents",
    slug: "account-manager-independents",
    description:
      "Sell and keep Harbor lanes for grocers and makers who cannot miss a Thursday delivery.",
    responsibilities:
      "Own a book of independent accounts.\nQuote lanes.\nShow up when a shipment slips.",
    requirements:
      "B2B sales in logistics or wholesale.\nA car and a region.\nYou like small operators.",
    department: "Sales",
    employmentType: "full_time",
    workplaceType: "hybrid",
    location: "Savannah, GA",
    salaryMin: 7500000,
    salaryMax: 9500000,
    salaryCurrency: "USD",
    salaryPeriod: "year",
    showSalary: true,
    skills: ["Sales", "Freight", "CRM"],
    experienceLevel: "mid",
    status: "published",
    publishedAt: daysAgo(9),
    closesAt: null,
    promotionTier: "none",
    promotedUntil: null,
    promotionSpendCents: 0,
    viewCount: 98,
    applicationCount: 8,
  },
  {
    id: "a3333333-3333-4333-8333-333333333304",
    companyId: HARBOR_ID,
    title: "Weekend warehouse associate",
    slug: "weekend-warehouse-associate",
    description:
      "Saturday–Sunday cross-dock in Savannah. Pallet jacks, labels, and getting the morning trucks staged.",
    responsibilities:
      "Receive and stage.\nScan every label.\nLeave the dock ready for Monday.",
    requirements:
      "Able to stand a shift.\nWeekend availability.\nWarehouse experience preferred, not required.",
    department: "Warehouse",
    employmentType: "part_time",
    workplaceType: "onsite",
    location: "Savannah, GA",
    salaryMin: 180000,
    salaryMax: 200000,
    salaryCurrency: "USD",
    salaryPeriod: "month",
    showSalary: true,
    skills: ["Warehouse", "Scanning", "Safety"],
    experienceLevel: "entry",
    status: "published",
    publishedAt: daysAgo(11),
    closesAt: null,
    promotionTier: "none",
    promotedUntil: null,
    promotionSpendCents: 0,
    viewCount: 84,
    applicationCount: 13,
  },
];

const companyById = new Map(DEMO_COMPANIES.map((company) => [company.id, company]));

export const DEMO_JOBS: JobWithCompany[] = JOBS.map((job) => {
  const company = companyById.get(job.companyId);
  if (!company) {
    throw new Error(`Demo job ${job.slug} is missing its company`);
  }
  return { ...job, company };
});

export function getDemoCompany(slug: string): CompanyRecord | undefined {
  return DEMO_COMPANIES.find((company) => company.slug === slug);
}

export function getDemoJob(
  companySlug: string,
  jobSlug: string,
): JobWithCompany | undefined {
  return DEMO_JOBS.find(
    (job) => job.company.slug === companySlug && job.slug === jobSlug,
  );
}

export { JOBS as DEMO_JOB_ROWS };

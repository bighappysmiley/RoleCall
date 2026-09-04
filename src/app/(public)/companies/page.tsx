import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { companies, jobs } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const rows = await db.select().from(companies).orderBy(companies.name);

  const counts = await db
    .select({
      companyId: jobs.companyId,
      n: jobs.id,
    })
    .from(jobs)
    .where(eq(jobs.status, "published"));

  const countMap = new Map<string, number>();
  for (const c of counts) {
    countMap.set(c.companyId, (countMap.get(c.companyId) || 0) + 1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-medium tracking-tight">
        Companies
      </h1>
      <p className="mt-2 text-[var(--muted)]">
        Public company profiles with open roles.
      </p>
      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {rows.map((c) => (
          <Link
            key={c.id}
            href={`/companies/${c.slug}`}
            className="border border-[var(--line)] bg-[var(--paper)] p-5 hover:bg-[var(--fog)]"
          >
            <h2 className="font-display text-xl font-medium">{c.name}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {c.tagline || c.industry || "Company profile"}
            </p>
            <p className="mt-4 font-mono-data text-xs text-[var(--muted)]">
              {countMap.get(c.id) || 0} open roles
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

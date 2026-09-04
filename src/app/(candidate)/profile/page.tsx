import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { getCurrentProfile } from "@/actions/auth";
import { updateProfileAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/db";
import { applications, jobs, companies } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");
  if (current.profile.accountType === "employer") redirect("/dashboard");

  const apps = await db
    .select({
      id: applications.id,
      stage: applications.stage,
      createdAt: applications.createdAt,
      jobTitle: jobs.title,
      companyName: companies.name,
      companySlug: companies.slug,
      jobSlug: jobs.slug,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .where(eq(applications.candidateId, current.profile.id));

  const p = current.profile;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
        Your profile
      </h1>
      <p className="mt-2 text-[var(--muted)]">
        Keep this up to date so employers see who you are.
      </p>

      <form action={updateProfileAction} className="surface-card mt-8 space-y-4 p-6 sm:p-8">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" defaultValue={p.fullName} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="headline">Headline</Label>
          <Input
            id="headline"
            name="headline"
            defaultValue={p.headline ?? ""}
            placeholder="e.g. Product designer in Chicago"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={p.location ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">About you</Label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={p.bio ?? ""}
            rows={4}
            className="w-full rounded-[6px] border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2 text-sm"
          />
        </div>
        <Button type="submit">Save profile</Button>
      </form>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">Applications</h2>
        {apps.length === 0 ? (
          <div className="surface-card mt-4 px-6 py-10 text-center">
            <p className="text-sm text-[var(--muted)]">
              You haven&apos;t applied to any roles yet.
            </p>
            <Link href="/jobs" className="mt-4 inline-block">
              <Button variant="secondary">Browse open roles</Button>
            </Link>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {apps.map((a) => (
              <li
                key={a.id}
                className="surface-card flex items-center justify-between px-5 py-4"
              >
                <div>
                  <Link
                    href={`/jobs/${a.companySlug}/${a.jobSlug}`}
                    className="font-medium hover:text-[var(--primary)]"
                  >
                    {a.jobTitle}
                  </Link>
                  <p className="text-sm text-[var(--muted)]">{a.companyName}</p>
                </div>
                <span className="badge capitalize">{a.stage.replaceAll("_", " ")}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

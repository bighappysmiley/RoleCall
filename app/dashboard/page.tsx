import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/auth/server";
import {
  ensureProfile,
  listCandidateApplications,
  listMemberships,
  listSavedJobs,
} from "@/lib/queries";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getOptionalSession();
  if (!session?.user) {
    redirect("/login");
  }

  const profile = await ensureProfile({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  });

  if (!profile?.accountType) {
    redirect("/onboarding");
  }

  const [memberships, applications, saved] = await Promise.all([
    listMemberships(session.user.id),
    listCandidateApplications(session.user.id),
    listSavedJobs(session.user.id),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
        {profile.accountType === "employer" ? "EMPLOYER" : "CANDIDATE"}
        {profile.isPlatformAdmin ? " · PLATFORM ADMIN" : ""}
      </p>
      <h1 className="mt-2 font-heading text-4xl">
        Hello{profile.fullName ? `, ${profile.fullName.split(" ")[0]}` : ""}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        {profile.accountType === "employer"
          ? "Company editor, job posts, the pipeline, and billing ship in the next phases. Your account and profile work today."
          : "Keep your profile current. Applications you send show up here."}
      </p>
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        <section className="border border-line p-4">
          <h2 className="font-mono text-[11px] tracking-wider text-muted-foreground">
            PROFILE
          </h2>
          <p className="mt-2 text-sm">{profile.headline ?? "No headline yet."}</p>
          <Button className="mt-4" size="sm" variant="outline" asChild>
            <Link href="/profile">Edit profile</Link>
          </Button>
        </section>
        {profile.accountType === "employer" ? (
          <section className="border border-line p-4">
            <h2 className="font-mono text-[11px] tracking-wider text-muted-foreground">
              COMPANIES
            </h2>
            {memberships.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No company seat yet. Creating a company is the next phase.
              </p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm">
                {memberships.map((row) => (
                  <li key={row.id}>
                    {row.company.name}{" "}
                    <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                      {row.role.toUpperCase()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <section className="border border-line p-4">
            <h2 className="font-mono text-[11px] tracking-wider text-muted-foreground">
              APPLICATIONS
            </h2>
            <p className="mt-2 text-2xl font-heading">{applications.length}</p>
            <p className="text-sm text-muted-foreground">on file</p>
          </section>
        )}
        <section className="border border-line p-4">
          <h2 className="font-mono text-[11px] tracking-wider text-muted-foreground">
            {profile.accountType === "candidate" ? "SAVED" : "NEXT"}
          </h2>
          {profile.accountType === "candidate" ? (
            <p className="mt-2 text-2xl font-heading">{saved.length}</p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Job CRUD, kanban, invites, and Stripe after you say continue.
            </p>
          )}
        </section>
      </div>
      {profile.accountType === "candidate" && applications.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-heading text-2xl">Applications</h2>
          <ul className="mt-3 divide-y divide-line border border-line">
            {applications.map((row) => (
              <li key={row.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <Link
                  href={`/jobs/${row.company.slug}/${row.job.slug}`}
                  className="hover:underline"
                >
                  {row.job.title}
                  <span className="text-muted-foreground"> · {row.company.name}</span>
                </Link>
                <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                  {row.stage.toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

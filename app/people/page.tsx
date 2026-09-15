import type { Metadata } from "next";
import Link from "next/link";
import { NameWithBadge } from "@/components/badge-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listPublicPeople } from "@/lib/messaging";

export const metadata: Metadata = {
  title: "People",
};

export const dynamic = "force-dynamic";

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const q = raw?.trim() ?? "";
  const people = await listPublicPeople(48, q || undefined);

  return (
    <div className="page-shell">
      <p className="eyebrow">Directory</p>
      <h1 className="mt-2 font-display text-4xl tracking-[-0.04em] sm:text-5xl">
        People
      </h1>
      <p className="mt-3 max-w-xl text-base text-muted-foreground">
        Browse public candidate profiles across RoleCall.
      </p>
      <form
        method="get"
        action="/people"
        className="surface mt-8 flex flex-wrap items-end gap-3 p-4 sm:p-5"
      >
        <div className="grid min-w-[16rem] flex-1 gap-1.5">
          <label
            htmlFor="q"
            className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase"
          >
            Search
          </label>
          <Input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Name, headline, location"
            className="h-10 rounded-xl bg-white"
          />
        </div>
        <Button type="submit" className="h-10 rounded-xl px-5">
          Search
        </Button>
        {q ? (
          <Button type="button" variant="outline" className="h-10 rounded-xl" asChild>
            <Link href="/people">Clear</Link>
          </Button>
        ) : null}
      </form>
      {people.length === 0 ? (
        <div className="surface mt-10 px-6 py-10 text-sm text-muted-foreground">
          <p>
            {q
              ? "No people match that search."
              : "No public profiles yet. Candidates appear here after they set up a profile."}
          </p>
          {q ? (
            <Button className="mt-4" size="sm" variant="outline" asChild>
              <Link href="/people">Clear search</Link>
            </Button>
          ) : (
            <Button className="mt-4" size="sm" variant="outline" asChild>
              <Link href="/profile">Update your profile</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {people.map((person) => (
            <Link
              key={person.id}
              href={`/people/${person.id}`}
              className="surface surface-hover flex gap-4 p-5"
            >
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-fog text-sm font-medium text-ink">
                {person.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={person.avatarUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  (person.fullName ?? "?").slice(0, 1)
                )}
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-xl tracking-[-0.03em]">
                  <NameWithBadge name={person.fullName ?? "Member"} />
                </h2>
                {person.headline ? (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {person.headline}
                  </p>
                ) : null}
                {person.location ? (
                  <p className="mt-3 text-xs tracking-wide text-muted-foreground">
                    {person.location}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

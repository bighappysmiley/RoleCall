import Link from "next/link";
import { colorFromString, initials } from "@/lib/format";

type Props = {
  slug: string;
  name: string;
  tagline?: string | null;
  industry?: string | null;
  locationLabel?: string | null;
  openRoles: number;
  salaryLabel?: string | null;
  skills?: string[];
};

export function CompanyCard({
  slug,
  name,
  tagline,
  industry,
  locationLabel,
  openRoles,
  salaryLabel,
  skills = [],
}: Props) {
  const markColor = colorFromString(name);

  return (
    <Link
      href={`/companies/${slug}`}
      className="surface-card surface-card-lift group block overflow-hidden transition-all duration-200"
    >
      <div
        className="h-32 w-full"
        style={{
          background: `linear-gradient(135deg, ${markColor} 0%, color-mix(in srgb, ${markColor} 55%, white) 100%)`,
        }}
      />
      <div className="relative px-5 pb-5 pt-0">
        <div
          className="-mt-8 flex h-16 w-16 items-center justify-center rounded-[8px] border-2 border-[var(--paper)] text-lg font-semibold text-white"
          style={{ background: markColor }}
        >
          {initials(name)}
        </div>
        <h2 className="mt-3 font-display text-xl font-semibold tracking-tight text-[var(--ink)] group-hover:text-[var(--primary)]">
          {name}
        </h2>
        <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
          {tagline || industry || "Hiring on RoleCall"}
        </p>
        {salaryLabel ? (
          <p className="mt-3 font-display text-lg font-semibold text-[var(--ink)]">
            {salaryLabel}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {locationLabel ? (
            <span className="skill-chip">{locationLabel}</span>
          ) : null}
          <span className="skill-chip">
            {openRoles} open {openRoles === 1 ? "role" : "roles"}
          </span>
          {skills.slice(0, 3).map((skill) => (
            <span key={skill} className="skill-chip">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

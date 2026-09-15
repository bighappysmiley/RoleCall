import Link from "next/link";
import { formatEmployment, formatWorkplace } from "@/lib/format";
import {
  EMPLOYMENT_TYPES,
  WORKPLACE_TYPES,
  type JobBoardFilters,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EXPERIENCE_OPTIONS = [
  "Internship",
  "Entry",
  "Mid",
  "Senior",
  "Lead",
  "Director",
];

function hasActiveFilters(filters: JobBoardFilters) {
  return Boolean(
    filters.q ||
      filters.type ||
      filters.workplace ||
      filters.location ||
      filters.experience ||
      filters.skill,
  );
}

export function JobsFilter({ filters }: { filters: JobBoardFilters }) {
  const active = hasActiveFilters(filters);

  return (
    <div className="space-y-3">
      <form
        method="get"
        action="/jobs"
        className="surface grid gap-3 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-[1.2fr_9rem_9rem_1fr_9rem_9rem_auto] xl:items-end"
      >
        <div className="grid gap-1.5 md:col-span-2 xl:col-span-1">
          <label
            htmlFor="q"
            className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase"
          >
            Search
          </label>
          <Input
            id="q"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Title, skill, company"
          />
        </div>
        <div className="grid gap-1.5">
          <label
            htmlFor="type"
            className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase"
          >
            Type
          </label>
          <select
            id="type"
            name="type"
            defaultValue={filters.type ?? ""}
            className="h-9 rounded-xl border border-input bg-white/70 px-2.5 text-sm"
          >
            <option value="">Any</option>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {formatEmployment(type)}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <label
            htmlFor="workplace"
            className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase"
          >
            Place
          </label>
          <select
            id="workplace"
            name="workplace"
            defaultValue={filters.workplace ?? ""}
            className="h-9 rounded-xl border border-input bg-white/70 px-2.5 text-sm"
          >
            <option value="">Any</option>
            {WORKPLACE_TYPES.map((type) => (
              <option key={type} value={type}>
                {formatWorkplace(type)}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <label
            htmlFor="location"
            className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase"
          >
            Location
          </label>
          <Input
            id="location"
            name="location"
            defaultValue={filters.location ?? ""}
            placeholder="City or remote"
          />
        </div>
        <div className="grid gap-1.5">
          <label
            htmlFor="experience"
            className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase"
          >
            Level
          </label>
          <select
            id="experience"
            name="experience"
            defaultValue={filters.experience ?? ""}
            className="h-9 rounded-xl border border-input bg-white/70 px-2.5 text-sm"
          >
            <option value="">Any</option>
            {EXPERIENCE_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <label
            htmlFor="skill"
            className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase"
          >
            Skill
          </label>
          <Input
            id="skill"
            name="skill"
            defaultValue={filters.skill ?? ""}
            placeholder="React, design…"
          />
        </div>
        <Button type="submit" className="md:h-8">
          Filter
        </Button>
      </form>
      {active ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Active filters</span>
          {filters.q ? (
            <span className="rounded-full border border-line/80 bg-fog/80 px-2.5 py-1">“{filters.q}”</span>
          ) : null}
          {filters.type ? (
            <span className="rounded-full border border-line/80 bg-fog/80 px-2.5 py-1">
              {formatEmployment(filters.type)}
            </span>
          ) : null}
          {filters.workplace ? (
            <span className="rounded-full border border-line/80 bg-fog/80 px-2.5 py-1">
              {formatWorkplace(filters.workplace)}
            </span>
          ) : null}
          {filters.location ? (
            <span className="rounded-full border border-line/80 bg-fog/80 px-2.5 py-1">
              {filters.location}
            </span>
          ) : null}
          {filters.experience ? (
            <span className="rounded-full border border-line/80 bg-fog/80 px-2.5 py-1">
              {filters.experience}
            </span>
          ) : null}
          {filters.skill ? (
            <span className="rounded-full border border-line/80 bg-fog/80 px-2.5 py-1">{filters.skill}</span>
          ) : null}
          <Link href="/jobs" className="text-primary hover:underline">
            Clear all
          </Link>
        </div>
      ) : null}
    </div>
  );
}

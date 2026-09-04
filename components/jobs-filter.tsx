import { formatEmployment, formatWorkplace } from "@/lib/format";
import {
  EMPLOYMENT_TYPES,
  WORKPLACE_TYPES,
  type JobBoardFilters,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function JobsFilter({ filters }: { filters: JobBoardFilters }) {
  return (
    <form method="get" action="/jobs" className="grid gap-3 border border-line bg-paper p-4 md:grid-cols-[1fr_10rem_10rem_1fr_auto] md:items-end">
      <div className="grid gap-1.5">
        <label htmlFor="q" className="font-mono text-[11px] tracking-wider text-muted-foreground">
          SEARCH
        </label>
        <Input id="q" name="q" defaultValue={filters.q ?? ""} placeholder="Title, skill, company" />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="type" className="font-mono text-[11px] tracking-wider text-muted-foreground">
          TYPE
        </label>
        <select
          id="type"
          name="type"
          defaultValue={filters.type ?? ""}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
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
        <label htmlFor="workplace" className="font-mono text-[11px] tracking-wider text-muted-foreground">
          PLACE
        </label>
        <select
          id="workplace"
          name="workplace"
          defaultValue={filters.workplace ?? ""}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
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
        <label htmlFor="location" className="font-mono text-[11px] tracking-wider text-muted-foreground">
          LOCATION
        </label>
        <Input
          id="location"
          name="location"
          defaultValue={filters.location ?? ""}
          placeholder="City or remote"
        />
      </div>
      <Button type="submit" className="h-8">
        Filter
      </Button>
    </form>
  );
}
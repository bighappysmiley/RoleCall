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
    <form
      method="get"
      action="/jobs"
      className="grid gap-3 border border-line bg-white/90 p-4 md:grid-cols-[1fr_10rem_10rem_1fr_auto] md:items-end"
    >
      <div className="grid gap-1.5">
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
      <Button type="submit" className="md:h-8">
        Filter
      </Button>
    </form>
  );
}

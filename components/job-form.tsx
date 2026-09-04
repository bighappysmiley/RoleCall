"use client";

import { useActionState } from "react";
import { createJobAction, updateJobAction } from "@/lib/actions/jobs";
import type { ActionState } from "@/lib/auth/state";
import { centsToDollarInput } from "@/lib/form";
import {
  EMPLOYMENT_TYPES,
  JOB_STATUSES,
  WORKPLACE_TYPES,
  type JobWithCompany,
} from "@/lib/types";
import { formatEmployment, formatJobStatus, formatWorkplace } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { RefreshOnSuccess } from "@/components/refresh-on-success";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function JobForm({
  companyId,
  job,
  readOnly,
}: {
  companyId: string;
  job?: JobWithCompany;
  readOnly?: boolean;
}) {
  const action = job ? updateJobAction : createJobAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    null,
  );

  return (
    <form
      key={job ? `${job.id}-${job.status}` : "new"}
      action={formAction}
      className="flex max-w-2xl flex-col gap-4"
    >
      <RefreshOnSuccess state={state} />
      <input type="hidden" name="companyId" value={companyId} />
      {job ? <input type="hidden" name="jobId" value={job.id} /> : null}
      <div className="grid gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={job?.title ?? ""}
          disabled={readOnly}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="employmentType">Type</Label>
          <select
            id="employmentType"
            name="employmentType"
            defaultValue={job?.employmentType ?? "full_time"}
            disabled={readOnly}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {formatEmployment(type)}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="workplaceType">Workplace</Label>
          <select
            id="workplaceType"
            name="workplaceType"
            defaultValue={job?.workplaceType ?? "remote"}
            disabled={readOnly}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {WORKPLACE_TYPES.map((type) => (
              <option key={type} value={type}>
                {formatWorkplace(type)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            defaultValue={job?.location ?? ""}
            disabled={readOnly}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            name="department"
            defaultValue={job?.department ?? ""}
            disabled={readOnly}
          />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="description">The role</Label>
        <Textarea
          id="description"
          name="description"
          rows={7}
          required
          defaultValue={job?.description ?? ""}
          disabled={readOnly}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="responsibilities">You will</Label>
        <Textarea
          id="responsibilities"
          name="responsibilities"
          rows={5}
          defaultValue={job?.responsibilities ?? ""}
          disabled={readOnly}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="requirements">You have</Label>
        <Textarea
          id="requirements"
          name="requirements"
          rows={5}
          defaultValue={job?.requirements ?? ""}
          disabled={readOnly}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="skills">Skills (comma separated)</Label>
        <Input
          id="skills"
          name="skills"
          defaultValue={job?.skills.join(", ") ?? ""}
          disabled={readOnly}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="experienceLevel">Experience</Label>
          <Input
            id="experienceLevel"
            name="experienceLevel"
            defaultValue={job?.experienceLevel ?? ""}
            disabled={readOnly}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={job?.status ?? "draft"}
            disabled={readOnly}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {JOB_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatJobStatus(status)}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Published listings count toward the plan limit and appear on the public board.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="salaryMin">Salary min (USD)</Label>
          <Input
            id="salaryMin"
            name="salaryMin"
            inputMode="decimal"
            defaultValue={centsToDollarInput(job?.salaryMin ?? null)}
            disabled={readOnly}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="salaryMax">Salary max (USD)</Label>
          <Input
            id="salaryMax"
            name="salaryMax"
            inputMode="decimal"
            defaultValue={centsToDollarInput(job?.salaryMax ?? null)}
            disabled={readOnly}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="salaryPeriod">Period</Label>
          <select
            id="salaryPeriod"
            name="salaryPeriod"
            defaultValue={job?.salaryPeriod ?? "year"}
            disabled={readOnly}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="year">Year</option>
            <option value="month">Month</option>
            <option value="hour">Hour</option>
          </select>
        </div>
      </div>
      <input type="hidden" name="salaryCurrency" value="USD" />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="showSalary"
          defaultChecked={job?.showSalary ?? true}
          disabled={readOnly}
        />
        Show salary on the public listing
      </label>
      {state && "error" in state ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state && "success" in state ? (
        <p className="text-sm text-ink">{state.success}</p>
      ) : null}
      {readOnly ? (
        <p className="text-sm text-muted-foreground">
          Your seat is view-only. Ask a recruiter or admin to edit jobs.
        </p>
      ) : (
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Saving…" : job ? "Save job" : "Create job"}
        </Button>
      )}
    </form>
  );
}
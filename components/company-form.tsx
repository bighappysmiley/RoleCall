"use client";

import { useActionState } from "react";
import { createCompanyAction, updateCompanyAction } from "@/lib/actions/companies";
import type { ActionState } from "@/lib/auth/state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CompanyRecord } from "@/lib/types";

const SIZE_RANGES = ["1-10", "11-50", "51-200", "201-500", "500+"];

export function CompanyForm({
  company,
  readOnly,
}: {
  company?: CompanyRecord;
  readOnly?: boolean;
}) {
  const action = company ? updateCompanyAction : createCompanyAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    null,
  );

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      {company ? <input type="hidden" name="companyId" value={company.id} /> : null}
      <div className="grid gap-1.5">
        <Label htmlFor="name">Company name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={company?.name ?? ""}
          disabled={readOnly}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="tagline">Tagline</Label>
        <Input
          id="tagline"
          name="tagline"
          defaultValue={company?.tagline ?? ""}
          disabled={readOnly}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="description">About</Label>
        <Textarea
          id="description"
          name="description"
          rows={6}
          defaultValue={company?.description ?? ""}
          disabled={readOnly}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            type="url"
            defaultValue={company?.website ?? ""}
            disabled={readOnly}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            name="industry"
            defaultValue={company?.industry ?? ""}
            disabled={readOnly}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="sizeRange">Size</Label>
          <select
            id="sizeRange"
            name="sizeRange"
            defaultValue={company?.sizeRange ?? ""}
            disabled={readOnly}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">Select</option>
            {SIZE_RANGES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="foundedYear">Founded</Label>
          <Input
            id="foundedYear"
            name="foundedYear"
            inputMode="numeric"
            defaultValue={company?.foundedYear?.toString() ?? ""}
            disabled={readOnly}
          />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="locations">Locations (comma separated)</Label>
        <Input
          id="locations"
          name="locations"
          defaultValue={company?.locations.join(", ") ?? ""}
          disabled={readOnly}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="techStack">Tech stack (comma separated)</Label>
        <Input
          id="techStack"
          name="techStack"
          defaultValue={company?.techStack.join(", ") ?? ""}
          disabled={readOnly}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="benefits">Benefits (comma separated)</Label>
        <Input
          id="benefits"
          name="benefits"
          defaultValue={company?.benefits.join(", ") ?? ""}
          disabled={readOnly}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            name="linkedin"
            type="url"
            defaultValue={company?.socialLinks.linkedin ?? ""}
            disabled={readOnly}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="twitter">X / Twitter</Label>
          <Input
            id="twitter"
            name="twitter"
            type="url"
            defaultValue={company?.socialLinks.twitter ?? ""}
            disabled={readOnly}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            name="github"
            type="url"
            defaultValue={company?.socialLinks.github ?? ""}
            disabled={readOnly}
          />
        </div>
      </div>
      {state && "error" in state ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state && "success" in state ? (
        <p className="text-sm text-ink">{state.success}</p>
      ) : null}
      {readOnly ? (
        <p className="text-sm text-muted-foreground">
          Your seat is view-only. Ask an admin to change the company profile.
        </p>
      ) : (
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Saving…" : company ? "Save company" : "Create company"}
        </Button>
      )}
    </form>
  );
}
"use client";

import { useActionState, useState } from "react";
import {
  createBadgeAction,
  deleteBadgeAction,
  updateBadgeAction,
} from "@/lib/actions/badges";
import type { ActionState } from "@/lib/auth/state";
import { BadgeIcon } from "@/components/badge-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RefreshOnSuccess } from "@/components/refresh-on-success";
import type { BadgeRecord } from "@/lib/types";

function Status({ state }: { state: ActionState }) {
  if (!state) return null;
  if ("error" in state) {
    return <p className="text-sm text-destructive">{state.error}</p>;
  }
  return <p className="text-sm text-ink">{state.success}</p>;
}

function IconPicker({
  name = "iconDataUrl",
  required,
  initial,
}: {
  name?: string;
  required?: boolean;
  initial?: string | null;
}) {
  const [preview, setPreview] = useState(initial ?? "");

  return (
    <div className="grid gap-2">
      <Label htmlFor={`${name}-file`}>Icon</Label>
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center border border-dashed border-line bg-[linear-gradient(45deg,#e8eef7_25%,transparent_25%),linear-gradient(-45deg,#e8eef7_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e8eef7_75%),linear-gradient(-45deg,transparent_75%,#e8eef7_75%)] bg-[length:12px_12px] bg-[position:0_0,0_6px,6px_-6px,-6px_0]">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              className="size-8 object-contain"
              style={{ background: "transparent" }}
            />
          ) : null}
        </div>
        <Input
          id={`${name}-file`}
          type="file"
          accept="image/png,image/webp,image/gif,image/svg+xml"
          required={required && !preview}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) {
              return;
            }
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === "string") {
                setPreview(reader.result);
              }
            };
            reader.readAsDataURL(file);
          }}
        />
      </div>
      <input type="hidden" name={name} value={preview} />
      <p className="text-xs text-muted-foreground">
        Transparent PNG/SVG/WebP works best. Keep it small.
      </p>
    </div>
  );
}

export function CreateBadgeForm() {
  const [state, action, pending] = useActionState(createBadgeAction, null);
  return (
    <form action={action} className="space-y-3 border border-line bg-white/90 p-4">
      <RefreshOnSuccess state={state} />
      <h3 className="font-heading text-xl">Create badge</h3>
      <div className="grid gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required placeholder="Top Employer" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      <IconPicker required />
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create badge"}
      </Button>
      <Status state={state} />
    </form>
  );
}

export function BadgeAdminList({ badges }: { badges: BadgeRecord[] }) {
  return (
    <ul className="space-y-3">
      {badges.map((badge) => (
        <BadgeAdminRow key={badge.id} badge={badge} />
      ))}
    </ul>
  );
}

function BadgeAdminRow({ badge }: { badge: BadgeRecord }) {
  const [updateState, updateAction, updatePending] = useActionState(
    updateBadgeAction,
    null,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteBadgeAction,
    null,
  );

  return (
    <li className="border border-line bg-white/90 p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center border border-line bg-[linear-gradient(45deg,#e8eef7_25%,transparent_25%),linear-gradient(-45deg,#e8eef7_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e8eef7_75%),linear-gradient(-45deg,transparent_75%,#e8eef7_75%)] bg-[length:10px_10px] bg-[position:0_0,0_5px,5px_-5px,-5px_0]">
          <BadgeIcon badge={badge} size={28} />
        </div>
        <div>
          <p className="font-medium">{badge.name}</p>
          <p className="text-xs text-muted-foreground">{badge.slug}</p>
        </div>
      </div>
      <form action={updateAction} className="space-y-3">
        <input type="hidden" name="badgeId" value={badge.id} />
        <div className="grid gap-1.5">
          <Label htmlFor={`name-${badge.id}`}>Name</Label>
          <Input
            id={`name-${badge.id}`}
            name="name"
            defaultValue={badge.name}
            required
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`description-${badge.id}`}>Description</Label>
          <Textarea
            id={`description-${badge.id}`}
            name="description"
            rows={2}
            defaultValue={badge.description ?? ""}
          />
        </div>
        <IconPicker initial={badge.iconDataUrl} />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="sm" disabled={updatePending}>
            {updatePending ? "Saving…" : "Save"}
          </Button>
        </div>
        <Status state={updateState} />
      </form>
      <form action={deleteAction} className="mt-3">
        <input type="hidden" name="badgeId" value={badge.id} />
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          disabled={deletePending}
        >
          {deletePending ? "Deleting…" : "Delete badge"}
        </Button>
        <Status state={deleteState} />
      </form>
    </li>
  );
}

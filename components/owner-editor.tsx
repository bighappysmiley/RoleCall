"use client";

import { useActionState, useState } from "react";
import { Pencil } from "lucide-react";
import {
  awardCompanyBadgeAction,
  awardProfileBadgeAction,
  ownerUpdateCompanyAction,
  ownerUpdateProfileAction,
  pinCompanyBadgeAction,
  pinProfileBadgeAction,
  revokeCompanyBadgeAction,
  revokeProfileBadgeAction,
} from "@/lib/actions/badges";
import type { ActionState } from "@/lib/auth/state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BadgeIcon } from "@/components/badge-icon";
import { RefreshOnSuccess } from "@/components/refresh-on-success";
import type {
  AssignedBadge,
  BadgeRecord,
  CompanyRecord,
  ProfileRecord,
} from "@/lib/types";

function Status({ state }: { state: ActionState }) {
  if (!state) {
    return null;
  }
  if ("error" in state) {
    return <p className="text-sm text-destructive">{state.error}</p>;
  }
  return <p className="text-sm text-ink">{state.success}</p>;
}

export function ProfileOwnerEditor({
  profile,
  assigned,
  catalog,
  canAward,
}: {
  profile: ProfileRecord;
  assigned: AssignedBadge[];
  catalog: BadgeRecord[];
  canAward: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [editState, editAction, editPending] = useActionState(
    ownerUpdateProfileAction,
    null,
  );
  const [pinState, pinAction, pinPending] = useActionState(
    pinProfileBadgeAction,
    null,
  );
  const [awardState, awardAction, awardPending] = useActionState(
    awardProfileBadgeAction,
    null,
  );
  const [revokeState, revokeAction, revokePending] = useActionState(
    revokeProfileBadgeAction,
    null,
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label="Edit profile"
        >
          <Pencil className="size-3.5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Update the public profile and manage badges.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-8 px-4 pb-8">
          <form action={editAction} className="space-y-3">
            <RefreshOnSuccess state={editState} />
            <input type="hidden" name="profileId" value={profile.id} />
            <div className="grid gap-1.5">
              <Label htmlFor="fullName">Name</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={profile.fullName ?? ""}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                name="headline"
                defaultValue={profile.headline ?? ""}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                defaultValue={profile.location ?? ""}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                rows={4}
                defaultValue={profile.bio ?? ""}
              />
            </div>
            <Button type="submit" disabled={editPending}>
              {editPending ? "Saving…" : "Save profile"}
            </Button>
            <Status state={editState} />
          </form>

          <form action={pinAction} className="space-y-3 border-t border-line pt-6">
            <RefreshOnSuccess state={pinState} />
            <h3 className="font-heading text-lg">Pin a badge</h3>
            <p className="text-sm text-muted-foreground">
              The pinned badge appears next to the name: Johnny{" "}
              <span className="inline-block align-middle">[badge]</span>
            </p>
            <input type="hidden" name="profileId" value={profile.id} />
            <select
              name="badgeId"
              defaultValue={assigned.find((b) => b.isPinned)?.id ?? "__none__"}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="__none__">No pinned badge</option>
              {assigned.map((badge) => (
                <option key={badge.id} value={badge.id}>
                  {badge.name}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline" disabled={pinPending}>
              {pinPending ? "Saving…" : "Update pin"}
            </Button>
            <Status state={pinState} />
          </form>

          {assigned.length > 0 ? (
            <div className="space-y-2 border-t border-line pt-6">
              <h3 className="font-heading text-lg">Assigned badges</h3>
              <ul className="space-y-2">
                {assigned.map((badge) => (
                  <li
                    key={badge.assignmentId}
                    className="flex items-center justify-between gap-2 border border-line px-3 py-2"
                  >
                    <span className="inline-flex items-center gap-2 text-sm">
                      <BadgeIcon badge={badge} />
                      {badge.name}
                      {badge.isPinned ? (
                        <span className="font-mono text-[10px] tracking-wider text-primary">
                          PINNED
                        </span>
                      ) : null}
                    </span>
                    {canAward ? (
                      <form action={revokeAction}>
                        <RefreshOnSuccess state={revokeState} />
                        <input type="hidden" name="profileId" value={profile.id} />
                        <input type="hidden" name="badgeId" value={badge.id} />
                        <Button
                          type="submit"
                          size="sm"
                          variant="ghost"
                          disabled={revokePending}
                        >
                          Remove
                        </Button>
                      </form>
                    ) : null}
                  </li>
                ))}
              </ul>
              <Status state={revokeState} />
            </div>
          ) : null}

          {canAward ? (
            <form
              action={awardAction}
              className="space-y-3 border-t border-line pt-6"
            >
              <h3 className="font-heading text-lg">Add a badge</h3>
              <input type="hidden" name="profileId" value={profile.id} />
              <select
                name="badgeId"
                required
                className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                defaultValue=""
              >
                <option value="" disabled>
                  Choose badge
                </option>
                {catalog.map((badge) => (
                  <option key={badge.id} value={badge.id}>
                    {badge.name}
                  </option>
                ))}
              </select>
              <Button type="submit" disabled={awardPending}>
                {awardPending ? "Adding…" : "Add badge"}
              </Button>
              <Status state={awardState} />
            </form>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function CompanyOwnerEditor({
  company,
  assigned,
  catalog,
  canAward,
}: {
  company: CompanyRecord;
  assigned: AssignedBadge[];
  catalog: BadgeRecord[];
  canAward: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [editState, editAction, editPending] = useActionState(
    ownerUpdateCompanyAction,
    null,
  );
  const [pinState, pinAction, pinPending] = useActionState(
    pinCompanyBadgeAction,
    null,
  );
  const [awardState, awardAction, awardPending] = useActionState(
    awardCompanyBadgeAction,
    null,
  );
  const [revokeState, revokeAction, revokePending] = useActionState(
    revokeCompanyBadgeAction,
    null,
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label="Edit company"
        >
          <Pencil className="size-3.5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit company</SheetTitle>
          <SheetDescription>
            Update company details and manage badges.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-8 px-4 pb-8">
          <form action={editAction} className="space-y-3">
            <RefreshOnSuccess state={editState} />
            <input type="hidden" name="companyId" value={company.id} />
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={company.name} required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                name="tagline"
                defaultValue={company.tagline ?? ""}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="description">About</Label>
              <Textarea
                id="description"
                name="description"
                rows={5}
                defaultValue={company.description ?? ""}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={company.website ?? ""}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  name="industry"
                  defaultValue={company.industry ?? ""}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="sizeRange">Size</Label>
                <Input
                  id="sizeRange"
                  name="sizeRange"
                  defaultValue={company.sizeRange ?? ""}
                />
              </div>
            </div>
            <Button type="submit" disabled={editPending}>
              {editPending ? "Saving…" : "Save company"}
            </Button>
            <Status state={editState} />
          </form>

          <form action={pinAction} className="space-y-3 border-t border-line pt-6">
            <RefreshOnSuccess state={pinState} />
            <h3 className="font-heading text-lg">Pin a badge</h3>
            <p className="text-sm text-muted-foreground">
              Shows next to the company name across RoleCall.
            </p>
            <input type="hidden" name="companyId" value={company.id} />
            <select
              name="badgeId"
              defaultValue={assigned.find((b) => b.isPinned)?.id ?? "__none__"}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="__none__">No pinned badge</option>
              {assigned.map((badge) => (
                <option key={badge.id} value={badge.id}>
                  {badge.name}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline" disabled={pinPending}>
              {pinPending ? "Saving…" : "Update pin"}
            </Button>
            <Status state={pinState} />
          </form>

          {assigned.length > 0 ? (
            <div className="space-y-2 border-t border-line pt-6">
              <h3 className="font-heading text-lg">Assigned badges</h3>
              <ul className="space-y-2">
                {assigned.map((badge) => (
                  <li
                    key={badge.assignmentId}
                    className="flex items-center justify-between gap-2 border border-line px-3 py-2"
                  >
                    <span className="inline-flex items-center gap-2 text-sm">
                      <BadgeIcon badge={badge} />
                      {badge.name}
                      {badge.isPinned ? (
                        <span className="font-mono text-[10px] tracking-wider text-primary">
                          PINNED
                        </span>
                      ) : null}
                    </span>
                    {canAward ? (
                      <form action={revokeAction}>
                        <RefreshOnSuccess state={revokeState} />
                        <input type="hidden" name="companyId" value={company.id} />
                        <input type="hidden" name="badgeId" value={badge.id} />
                        <Button
                          type="submit"
                          size="sm"
                          variant="ghost"
                          disabled={revokePending}
                        >
                          Remove
                        </Button>
                      </form>
                    ) : null}
                  </li>
                ))}
              </ul>
              <Status state={revokeState} />
            </div>
          ) : null}

          {canAward ? (
            <form
              action={awardAction}
              className="space-y-3 border-t border-line pt-6"
            >
              <h3 className="font-heading text-lg">Add a badge</h3>
              <input type="hidden" name="companyId" value={company.id} />
              <select
                name="badgeId"
                required
                defaultValue=""
                className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                <option value="" disabled>
                  Choose badge
                </option>
                {catalog.map((badge) => (
                  <option key={badge.id} value={badge.id}>
                    {badge.name}
                  </option>
                ))}
              </select>
              <Button type="submit" disabled={awardPending}>
                {awardPending ? "Adding…" : "Add badge"}
              </Button>
              <Status state={awardState} />
            </form>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

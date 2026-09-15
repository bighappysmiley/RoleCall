"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/format";

const MAX_EDGE = 512;
const MAX_BYTES = 280_000;

async function fileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not process that image.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.9;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > MAX_BYTES && quality > 0.45) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  if (dataUrl.length > MAX_BYTES) {
    throw new Error("That photo is still too large. Try a smaller image.");
  }
  return dataUrl;
}

export function ProfileAvatarField({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(avatarUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onPick(file: File | null) {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file (JPG, PNG, or WebP).");
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setPreview(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-20 border border-line">
        {preview ? <AvatarImage src={preview} alt="" /> : null}
        <AvatarFallback className="bg-fog text-lg font-medium text-ink">
          {initials(name || "You")}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <input type="hidden" name="avatarUrl" value={preview} />
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(event) => onPick(event.target.files?.[0] ?? null)}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="size-3.5" />
            {busy ? "Processing…" : preview ? "Change photo" : "Add photo"}
          </Button>
          {preview ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full"
              disabled={busy}
              onClick={() => {
                setPreview("");
                setError(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              Remove
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          Square works best. We resize it before upload.
        </p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}

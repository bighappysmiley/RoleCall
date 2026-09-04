"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyLink({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="max-w-full truncate border border-line bg-fog px-2 py-1 font-mono text-[11px]">
        {value}
      </code>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  );
}
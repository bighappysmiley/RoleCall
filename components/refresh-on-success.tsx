"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ActionState } from "@/lib/auth/state";

export function RefreshOnSuccess({ state }: { state: ActionState }) {
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state) {
      router.refresh();
    }
  }, [state, router]);

  return null;
}

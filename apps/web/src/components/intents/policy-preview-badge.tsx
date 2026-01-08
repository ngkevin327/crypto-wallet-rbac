"use client";

import { cn } from "@/lib/cn";

export function PolicyPreviewBadge({
  decision,
}: {
  decision?: string;
  reasons?: string[];
}) {
  if (!decision) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-700/50 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-slate-600/50">
        Evaluating policy…
      </span>
    );
  }
  if (decision === "ALLOW") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
          "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30"
        )}
      >
        Auto-approved
      </span>
    );
  }
  if (decision === "REQUIRE_APPROVAL") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
          "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30"
        )}
      >
        Needs approvals
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        "bg-red-500/15 text-red-200 ring-1 ring-red-500/30"
      )}
    >
      Denied by policy
    </span>
  );
}

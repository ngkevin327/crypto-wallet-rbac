"use client";

export function PolicyPreviewBadge({
  decision,
}: {
  decision?: string;
  reasons?: string[];
}) {
  if (!decision) {
    return (
      <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-300">
        Evaluating…
      </span>
    );
  }
  if (decision === "ALLOW") {
    return (
      <span className="rounded-full bg-emerald-900/50 px-3 py-1 text-xs text-emerald-300">
        Auto-approved
      </span>
    );
  }
  if (decision === "REQUIRE_APPROVAL") {
    return (
      <span className="rounded-full bg-amber-900/50 px-3 py-1 text-xs text-amber-300">
        Needs approvals
      </span>
    );
  }
  return (
    <span className="rounded-full bg-red-900/50 px-3 py-1 text-xs text-red-300">
      Denied by policy
    </span>
  );
}

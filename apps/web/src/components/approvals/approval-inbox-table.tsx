"use client";

import type { ApprovalRecord } from "@/lib/api/approvals";

export function ApprovalInboxTable({
  items,
  onSelect,
}: {
  items: ApprovalRecord[];
  onSelect: (item: ApprovalRecord) => void;
}) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface-raised/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border bg-surface-overlay/40 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Intent</th>
            <th className="px-4 py-3">Quorum</th>
            <th className="px-4 py-3">Expires</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr
              key={row.id}
              className="cursor-pointer border-b border-surface-border/40 transition-colors last:border-0 hover:bg-brand-500/5"
              onClick={() => onSelect(row)}
            >
              <td className="px-4 py-3.5 font-mono text-xs text-slate-200">{row.intentId.slice(0, 10)}…</td>
              <td className="px-4 py-3.5 text-slate-300">{row.requiredCount} required</td>
              <td className="px-4 py-3.5 text-slate-500">{new Date(row.expiresAt).toLocaleString()}</td>
              <td className="px-4 py-3.5 text-right text-xs font-medium text-brand-300">Review →</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

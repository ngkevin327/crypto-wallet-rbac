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
    return <p className="text-sm text-slate-500">No approval requests in this tab.</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-slate-500 border-b border-surface-border">
          <th className="py-2">Intent</th>
          <th className="py-2">Quorum</th>
          <th className="py-2">Expires</th>
          <th className="py-2" />
        </tr>
      </thead>
      <tbody>
        {items.map((row) => (
          <tr
            key={row.id}
            className="border-b border-surface-border/50 hover:bg-surface cursor-pointer"
            onClick={() => onSelect(row)}
          >
            <td className="py-3 font-mono text-xs">{row.intentId.slice(0, 8)}…</td>
            <td className="py-3">{row.requiredCount} required</td>
            <td className="py-3 text-slate-400">
              {new Date(row.expiresAt).toLocaleString()}
            </td>
            <td className="py-3 text-accent text-xs">Review</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

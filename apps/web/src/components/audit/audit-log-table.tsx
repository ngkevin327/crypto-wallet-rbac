"use client";

import type { AuditEventRow } from "@/lib/api/audit";

export function AuditLogTable({
  items,
  loading,
  onLoadMore,
  hasMore,
}: {
  items: AuditEventRow[];
  loading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}) {
  return (
    <div className="space-y-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 border-b border-surface-border">
            <th className="py-2">Time</th>
            <th className="py-2">Event</th>
            <th className="py-2">Actor</th>
            <th className="py-2">Summary</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id} className="border-b border-surface-border/40">
              <td className="py-2 text-slate-400 whitespace-nowrap">
                {new Date(row.createdAt).toLocaleString()}
              </td>
              <td className="py-2 font-mono text-xs">{row.eventType}</td>
              <td className="py-2 font-mono text-xs text-slate-500">
                {row.actorId?.slice(0, 8) ?? "—"}
              </td>
              <td className="py-2 text-slate-300 truncate max-w-md">
                {JSON.stringify(row.payload).slice(0, 80)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasMore && (
        <button
          type="button"
          disabled={loading}
          onClick={onLoadMore}
          className="text-sm text-accent"
        >
          {loading ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}

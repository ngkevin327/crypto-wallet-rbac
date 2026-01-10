"use client";

import type { AuditEventRow } from "@/lib/api/audit";
import { TableShell, DataTable, DataTableHead, DataTableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { tableRowClassName } from "@/lib/ui-styles";
import { cn } from "@/lib/cn";

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
      <TableShell>
        <DataTable>
          <DataTableHead>
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Summary</th>
            </tr>
          </DataTableHead>
          <DataTableBody>
            {items.map((row) => (
              <tr key={row.id} className={tableRowClassName}>
                <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                  {new Date(row.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{row.eventType}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                  {row.actorId?.slice(0, 8) ?? "—"}
                </td>
                <td className={cn("max-w-md truncate px-4 py-3 text-slate-300")}>
                  {JSON.stringify(row.payload).slice(0, 80)}
                </td>
              </tr>
            ))}
          </DataTableBody>
        </DataTable>
      </TableShell>
      {hasMore && (
        <Button type="button" variant="ghost" disabled={loading} onClick={onLoadMore}>
          {loading ? "Loading…" : "Load more"}
        </Button>
      )}
    </div>
  );
}

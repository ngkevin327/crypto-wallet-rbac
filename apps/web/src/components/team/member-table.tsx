"use client";

import type { MemberRow } from "@/lib/api/orgs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableShell, DataTable, DataTableHead, DataTableBody } from "@/components/ui/table";
import { tableRowClassName } from "@/lib/ui-styles";
import { cn } from "@/lib/cn";

interface Props {
  members: MemberRow[];
  onDeactivate?: (memberId: string) => void;
  onSelect?: (member: MemberRow) => void;
}

export function MemberTable({ members, onDeactivate, onSelect }: Props) {
  return (
    <TableShell
      empty={
        members.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">No members yet.</p>
        ) : undefined
      }
    >
      <DataTable>
        <DataTableHead>
          <tr>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="w-24 px-4 py-3" />
          </tr>
        </DataTableHead>
        <DataTableBody>
          {members.map((m) => (
            <tr
              key={m.id}
              className={cn(tableRowClassName, "cursor-pointer")}
              onClick={() => onSelect?.(m)}
            >
              <td className="px-4 py-3 text-slate-200">{m.user.email}</td>
              <td className="px-4 py-3 text-slate-400">{m.platformRole}</td>
              <td className="px-4 py-3">
                <Badge tone={m.status as "active" | "invited" | "deactivated"}>{m.status}</Badge>
              </td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                {m.status === "active" && onDeactivate && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => onDeactivate(m.id)}
                  >
                    Deactivate
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </DataTableBody>
      </DataTable>
    </TableShell>
  );
}

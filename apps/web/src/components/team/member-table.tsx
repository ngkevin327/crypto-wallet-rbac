"use client";

import type { MemberRow } from "@/lib/api/orgs";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-300",
  invited: "bg-amber-500/20 text-amber-300",
  deactivated: "bg-slate-500/20 text-slate-400",
};

interface Props {
  members: MemberRow[];
  onDeactivate?: (memberId: string) => void;
  onSelect?: (member: MemberRow) => void;
}

export function MemberTable({ members, onDeactivate, onSelect }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-surface-border">
      <table className="w-full text-sm text-left">
        <thead className="bg-surface-raised text-slate-400 uppercase text-xs">
          <tr>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 w-24" />
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr
              key={m.id}
              className="border-t border-surface-border cursor-pointer hover:bg-surface/50"
              onClick={() => onSelect?.(m)}
            >
              <td className="px-4 py-3 text-slate-200">{m.user.email}</td>
              <td className="px-4 py-3 text-slate-400">{m.platformRole}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                    STATUS_STYLES[m.status] ?? STATUS_STYLES.active
                  }`}
                >
                  {m.status}
                </span>
              </td>
              <td className="px-4 py-3">
                {m.status === "active" && onDeactivate && (
                  <button
                    type="button"
                    onClick={() => onDeactivate(m.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Deactivate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {members.length === 0 && (
        <p className="px-4 py-8 text-center text-slate-500">No members yet.</p>
      )}
    </div>
  );
}

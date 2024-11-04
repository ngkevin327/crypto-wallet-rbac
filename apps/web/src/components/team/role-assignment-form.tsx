"use client";

import { useState } from "react";
import type { RoleRecord } from "@/lib/api/policies";
import { assignRole } from "@/lib/api/members";

interface Props {
  token: string;
  orgId: string;
  memberId: string;
  roles: RoleRecord[];
  onAssigned: () => void;
}

export function RoleAssignmentForm({ token, orgId, memberId, roles, onAssigned }: Props) {
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roleId) return;
    setLoading(true);
    try {
      await assignRole(token, orgId, memberId, roleId);
      onAssigned();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1">
        <label className="block text-xs text-slate-500 mb-1">Assign role</label>
        <select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="w-full rounded-md border border-surface-border bg-surface px-2 py-1.5 text-sm"
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-accent px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        Assign
      </button>
    </form>
  );
}

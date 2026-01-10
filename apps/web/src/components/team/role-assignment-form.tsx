"use client";

import { useState } from "react";
import type { RoleRecord } from "@/lib/api/policies";
import { assignRole } from "@/lib/api/members";
import { TemporaryAccessFields } from "./temporary-access-fields";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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
  const [temp, setTemp] = useState({ enabled: false, startsAt: "", endsAt: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roleId) return;
    setLoading(true);
    try {
      await assignRole(token, orgId, memberId, roleId, {
        startsAt: temp.enabled ? new Date(temp.startsAt).toISOString() : undefined,
        endsAt: temp.enabled ? new Date(temp.endsAt).toISOString() : undefined,
      });
      onAssigned();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TemporaryAccessFields {...temp} onChange={setTemp} />
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Select label="Assign role" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Assigning…" : "Assign"}
        </Button>
      </div>
    </form>
  );
}

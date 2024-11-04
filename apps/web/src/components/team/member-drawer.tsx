"use client";

import { useCallback, useEffect, useState } from "react";
import { listRoles, type RoleRecord } from "@/lib/api/policies";
import { listMemberRoles, revokeRole, type RoleAssignment } from "@/lib/api/members";
import { RoleAssignmentForm } from "./role-assignment-form";

interface MemberRow {
  id: string;
  user: { email: string };
}

interface Props {
  member: MemberRow;
  orgId: string;
  token: string;
  onClose: () => void;
}

export function MemberDrawer({ member, orgId, token, onClose }: Props) {
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);

  const refresh = useCallback(async () => {
    const [a, r] = await Promise.all([
      listMemberRoles(token, orgId, member.id),
      listRoles(token, orgId),
    ]);
    setAssignments(a);
    setRoles(r);
  }, [token, orgId, member.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <div className="w-full max-w-md bg-surface-raised border-l border-surface-border p-6 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">{member.user.email}</h2>
            <p className="text-xs text-slate-500">Role assignments</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            Close
          </button>
        </div>

        <RoleAssignmentForm
          token={token}
          orgId={orgId}
          memberId={member.id}
          roles={roles}
          onAssigned={refresh}
        />

        <ul className="mt-6 space-y-2">
          {assignments.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2 text-sm"
            >
              <span className="text-slate-200">{a.role.name}</span>
              <button
                type="button"
                onClick={() => revokeRole(token, orgId, member.id, a.id).then(refresh)}
                className="text-xs text-red-400 hover:underline"
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

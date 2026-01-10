"use client";

import { useCallback, useEffect, useState } from "react";
import { listRoles, type RoleRecord } from "@/lib/api/policies";
import { listMemberRoles, revokeRole, type RoleAssignment } from "@/lib/api/members";
import { RoleAssignmentForm } from "./role-assignment-form";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

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
    <Drawer
      open
      title={member.user.email}
      description="Treasury role assignments"
      onClose={onClose}
    >
      <RoleAssignmentForm
        token={token}
        orgId={orgId}
        memberId={member.id}
        roles={roles}
        onAssigned={refresh}
      />

      <ul className="mt-6 space-y-2">
        {assignments.map((a) => (
          <Card key={a.id}>
            <CardBody className="flex items-center justify-between gap-3 py-3">
              <span className="text-sm font-medium text-slate-200">{a.role.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300"
                onClick={() => revokeRole(token, orgId, member.id, a.id).then(refresh)}
              >
                Revoke
              </Button>
            </CardBody>
          </Card>
        ))}
      </ul>
    </Drawer>
  );
}

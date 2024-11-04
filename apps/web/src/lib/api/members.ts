import { apiRequest } from "../api-client";

export interface RoleAssignment {
  id: string;
  role: { id: string; name: string; templateType: string };
  walletId: string | null;
}

export function listMemberRoles(token: string, orgId: string, memberId: string) {
  return apiRequest<RoleAssignment[]>(`/orgs/${orgId}/members/${memberId}/roles`, { token });
}

export function assignRole(
  token: string,
  orgId: string,
  memberId: string,
  roleId: string,
  walletId?: string
) {
  return apiRequest(`/orgs/${orgId}/members/${memberId}/roles`, {
    method: "POST",
    token,
    body: { roleId, walletId },
  });
}

export function revokeRole(
  token: string,
  orgId: string,
  memberId: string,
  assignmentId: string
) {
  return apiRequest(`/orgs/${orgId}/members/${memberId}/roles/${assignmentId}`, {
    method: "DELETE",
    token,
  });
}

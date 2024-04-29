import { apiRequest } from "../api-client";

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

export interface MemberRow {
  id: string;
  platformRole: string;
  status: string;
  user: { id: string; email: string };
}

export function listOrgs(token: string) {
  return apiRequest<Organization[]>("/orgs", { token });
}

export function createOrg(token: string, name: string) {
  return apiRequest<Organization>("/orgs", {
    method: "POST",
    token,
    body: { name },
  });
}

export function listMembers(token: string, orgId: string) {
  return apiRequest<MemberRow[]>(`/orgs/${orgId}/members`, { token });
}

export function inviteMember(
  token: string,
  orgId: string,
  email: string,
  platformRole?: string
) {
  return apiRequest<{ inviteId: string; expiresAt: string }>(`/orgs/${orgId}/invites`, {
    method: "POST",
    token,
    body: { email, platformRole },
  });
}

export function deactivateMember(token: string, orgId: string, memberId: string) {
  return apiRequest<{ status: string }>(
    `/orgs/${orgId}/members/${memberId}/deactivate`,
    { method: "PATCH", token }
  );
}

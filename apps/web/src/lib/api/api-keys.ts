import { apiRequest } from "../api-client";

export interface ApiKeyRecord {
  id: string;
  name: string;
  keyPrefix: string;
  roleId: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export function listApiKeys(token: string, orgId: string) {
  return apiRequest<ApiKeyRecord[]>(`/orgs/${orgId}/api-keys`, { token });
}

export function createApiKey(
  token: string,
  orgId: string,
  body: { name: string; roleId: string }
) {
  return apiRequest<ApiKeyRecord & { secret: string }>(`/orgs/${orgId}/api-keys`, {
    method: "POST",
    token,
    body,
  });
}

export function revokeApiKey(token: string, orgId: string, keyId: string) {
  return apiRequest<void>(`/orgs/${orgId}/api-keys/${keyId}`, {
    method: "DELETE",
    token,
  });
}

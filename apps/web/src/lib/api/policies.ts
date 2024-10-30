import { apiRequest } from "../api-client";
import type { PolicyRule } from "@wtp/shared/policy/rule-types";

export interface PolicyRecord {
  id: string;
  organizationId: string;
  roleId: string;
  walletId: string | null;
  version: number;
  status: string;
  rules: PolicyRule[];
  updatedAt: string;
}

export interface RoleRecord {
  id: string;
  name: string;
  templateType: string;
}

export function listPolicies(token: string, orgId: string) {
  return apiRequest<PolicyRecord[]>(`/orgs/${orgId}/policies`, { token });
}

export function listRoles(token: string, orgId: string) {
  return apiRequest<RoleRecord[]>(`/orgs/${orgId}/roles`, { token });
}

export function createPolicy(
  token: string,
  orgId: string,
  roleId: string,
  rules: PolicyRule[],
  walletId?: string
) {
  return apiRequest<PolicyRecord>(`/orgs/${orgId}/roles/${roleId}/policies`, {
    method: "POST",
    token,
    body: { rules, walletId },
  });
}

export function updatePolicy(token: string, policyId: string, rules: PolicyRule[]) {
  return apiRequest<PolicyRecord>(`/policies/${policyId}`, {
    method: "PATCH",
    token,
    body: { rules },
  });
}

export function evaluatePolicy(
  token: string,
  body: {
    orgId: string;
    memberId: string;
    walletId: string;
    tokenAddress: string;
    chainId: number;
    amountNative: string;
  }
) {
  return apiRequest<{ decision: string; reasons: string[] }>(`/policy/evaluate`, {
    method: "POST",
    token,
    body,
  });
}

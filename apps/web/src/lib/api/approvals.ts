import { apiRequest } from "../api-client";

export interface ApprovalRecord {
  id: string;
  intentId: string;
  status: string;
  requiredCount: number;
  approverRoleIds: string[];
  expiresAt: string;
  intentStatus?: string;
  decisions?: {
    id: string;
    memberId: string;
    decision: string;
    decidedAt: string;
  }[];
}

export function listApprovals(token: string, orgId: string, status = "pending") {
  if (!orgId?.trim()) {
    return Promise.resolve([]);
  }
  return apiRequest<ApprovalRecord[]>(`/orgs/${orgId}/approvals?status=${status}`, { token });
}

export function decideApproval(
  token: string,
  requestId: string,
  body: { decision: "approved" | "rejected"; note?: string }
) {
  return apiRequest<ApprovalRecord>(`/approvals/${requestId}/decide`, {
    method: "POST",
    token,
    body,
  });
}

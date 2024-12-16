import { apiRequest } from "../api-client";

export interface AuditEventRow {
  id: string;
  eventType: string;
  actorId: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface AuditQueryResult {
  items: AuditEventRow[];
  nextCursor: string | null;
}

export function queryAuditEvents(
  token: string,
  orgId: string,
  params: Record<string, string>
) {
  const qs = new URLSearchParams(params).toString();
  return apiRequest<AuditQueryResult>(`/orgs/${orgId}/audit/events?${qs}`, { token });
}

export function startAuditExport(token: string, orgId: string, from: string, to: string) {
  return apiRequest<{ jobId: string }>(`/orgs/${orgId}/audit/export`, {
    method: "POST",
    token,
    body: { from, to },
  });
}

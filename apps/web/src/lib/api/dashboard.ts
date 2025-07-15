import { apiRequest } from "../api-client";

export interface DashboardSummary {
  pendingApprovals: number;
  intentsLast24h: number;
  policyDenials24h: number;
  recentActivity: {
    id: string;
    eventType: string;
    actorId: string | null;
    createdAt: string;
    payload: unknown;
  }[];
}

export function getDashboardSummary(token: string, orgId: string) {
  return apiRequest<DashboardSummary>(`/orgs/${orgId}/dashboard`, { token });
}

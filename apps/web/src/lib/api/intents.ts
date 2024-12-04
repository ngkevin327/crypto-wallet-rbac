import { apiRequest } from "../api-client";

export interface IntentRecord {
  id: string;
  organizationId: string;
  walletId: string;
  memberId: string;
  status: string;
  tokenAddress: string;
  chainId: number;
  amountNative: string;
  amountUsd?: string | null;
  toAddress: string;
  policyDecision: Record<string, unknown>;
  safeTxHash?: string | null;
  txHash?: string | null;
  failureReason?: string | null;
  createdAt: string;
  approvalRequest?: {
    id: string;
    status: string;
    requiredCount: number;
    expiresAt: string;
  } | null;
}

export function createIntent(
  token: string,
  orgId: string,
  body: {
    walletId: string;
    tokenAddress: string;
    chainId: number;
    amountNative: string;
    toAddress: string;
    calldata?: string;
  },
  idempotencyKey?: string
) {
  return apiRequest<IntentRecord>(`/orgs/${orgId}/intents`, {
    method: "POST",
    token,
    body,
    headers: idempotencyKey
      ? { "Idempotency-Key": idempotencyKey }
      : undefined,
  });
}

export function getIntent(token: string, intentId: string) {
  return apiRequest<IntentRecord>(`/intents/${intentId}`, { token });
}

export function listIntents(
  token: string,
  orgId: string,
  params?: { status?: string; memberId?: string }
) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.memberId) qs.set("memberId", params.memberId);
  const q = qs.toString();
  return apiRequest<IntentRecord[]>(`/orgs/${orgId}/intents${q ? `?${q}` : ""}`, { token });
}

export function proposeIntent(
  token: string,
  intentId: string,
  body: { senderAddress: string; signature?: string }
) {
  return apiRequest<IntentRecord>(`/intents/${intentId}/propose`, {
    method: "POST",
    token,
    body,
  });
}

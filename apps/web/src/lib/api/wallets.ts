import { apiRequest } from "../api-client";

export interface WalletRecord {
  id: string;
  address: string;
  chainId: number;
  nickname: string | null;
  safeThreshold: number | null;
  lastSyncedAt: string | null;
}

export interface ConnectChallenge {
  challengeId: string;
  message: string;
  expiresAt: string;
}

export function listWallets(token: string, orgId: string) {
  return apiRequest<WalletRecord[]>(`/orgs/${orgId}/wallets`, { token });
}

export function startWalletConnect(
  token: string,
  orgId: string,
  address: string,
  chainId: number,
  nickname?: string
) {
  return apiRequest<ConnectChallenge>(`/orgs/${orgId}/wallets/connect`, {
    method: "POST",
    token,
    body: { address, chainId, nickname },
  });
}

export function verifyWalletConnect(
  token: string,
  orgId: string,
  body: { address: string; chainId: number; challengeId: string; signature: string }
) {
  return apiRequest<WalletRecord>(`/orgs/${orgId}/wallets/verify`, {
    method: "POST",
    token,
    body,
  });
}

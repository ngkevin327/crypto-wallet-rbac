/** BullMQ queue names — processors registered in worker bootstrap. */
export const QUEUE_WALLET_SYNC = "wallet-sync";
export const QUEUE_APPROVAL_EXPIRY = "approval-expiry";
export const QUEUE_TX_STATUS = "tx-status";

export const WALLET_SYNC_JOB = "sync-wallet";
export const WALLET_SYNC_CRON = "wallet-sync-cron";

export const APPROVAL_EXPIRY_JOB = "approval-expiry-sweep";
export const APPROVAL_EXPIRY_CRON = "approval-expiry-cron";

export interface ApprovalExpiryJobPayload {
  cron?: boolean;
}

export const TX_STATUS_JOB = "tx-status-poll";

export interface TxStatusJobPayload {
  intentId: string;
  safeTxHash: string;
  chainId: number;
  attempt?: number;
}

export interface WalletSyncJobPayload {
  walletId?: string;
  cron?: boolean;
}

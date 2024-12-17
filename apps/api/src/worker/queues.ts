/** BullMQ queue names — processors registered in worker bootstrap. */
export const QUEUE_WALLET_SYNC = "wallet-sync";
export const QUEUE_APPROVAL_EXPIRY = "approval-expiry";
export const QUEUE_TX_STATUS = "tx-status";
export const QUEUE_AUDIT_EXPORT = "audit-export";
export const QUEUE_ACCESS_EXPIRY = "access-expiry";
export const QUEUE_APPROVAL_REMINDER = "approval-reminder";

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

export const AUDIT_EXPORT_JOB = "audit-export-run";

export interface AuditExportJobPayload {
  jobId: string;
  orgId: string;
}

export const ACCESS_EXPIRY_JOB = "access-expiry-sweep";
export const ACCESS_EXPIRY_CRON = "access-expiry-cron";

export interface AccessExpiryJobPayload {
  cron?: boolean;
}

export const APPROVAL_REMINDER_JOB = "approval-reminder-sweep";
export const APPROVAL_REMINDER_CRON = "approval-reminder-cron";

export interface ApprovalReminderJobPayload {
  cron?: boolean;
}

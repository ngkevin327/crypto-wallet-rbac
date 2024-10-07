/** Discriminated policy rule types — validated in @wtp/shared/policy.schema. */
export type PolicyRuleType =
  | "token_allowlist"
  | "wallet_allowlist"
  | "max_usd_per_transaction"
  | "max_usd_per_day"
  | "max_transactions_per_hour"
  | "require_approval";

export interface PolicyRuleBase {
  type: PolicyRuleType;
}

export interface TokenAllowlistRule extends PolicyRuleBase {
  type: "token_allowlist";
  addresses: string[];
}

export interface WalletAllowlistRule extends PolicyRuleBase {
  type: "wallet_allowlist";
  walletIds: string[];
}

export interface MaxUsdPerTransactionRule extends PolicyRuleBase {
  type: "max_usd_per_transaction";
  maxUsd: number;
}

export interface MaxUsdPerDayRule extends PolicyRuleBase {
  type: "max_usd_per_day";
  maxUsd: number;
}

export interface MaxTransactionsPerHourRule extends PolicyRuleBase {
  type: "max_transactions_per_hour";
  maxCount: number;
}

export interface RequireApprovalRule extends PolicyRuleBase {
  type: "require_approval";
  approverCount: number;
  approverRoleIds?: string[];
}

export type PolicyRule =
  | TokenAllowlistRule
  | WalletAllowlistRule
  | MaxUsdPerTransactionRule
  | MaxUsdPerDayRule
  | MaxTransactionsPerHourRule
  | RequireApprovalRule;

export interface PolicyDocument {
  version: number;
  rules: PolicyRule[];
}

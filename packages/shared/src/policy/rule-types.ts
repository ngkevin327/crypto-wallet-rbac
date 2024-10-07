/**
 * Policy rule DSL — discriminated union keyed by `type`.
 * Runtime validation lives in `policy.schema.ts`.
 */

export const POLICY_RULE_TYPES = [
  "token_allowlist",
  "wallet_allowlist",
  "max_usd_per_transaction",
  "max_usd_per_day",
  "max_transactions_per_hour",
  "require_approval",
] as const;

export type PolicyRuleType = (typeof POLICY_RULE_TYPES)[number];

export interface PolicyRuleBase {
  type: PolicyRuleType;
}

export interface TokenAllowlistRule extends PolicyRuleBase {
  type: "token_allowlist";
  /** ERC-20 contract addresses (checksummed or lowercase). */
  addresses: string[];
}

export interface WalletAllowlistRule extends PolicyRuleBase {
  type: "wallet_allowlist";
  /** Organization wallet ids this role may operate on. */
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
  /** Role ids whose members may approve; empty means any org admin. */
  approverRoleIds?: string[];
}

export type PolicyRule =
  | TokenAllowlistRule
  | WalletAllowlistRule
  | MaxUsdPerTransactionRule
  | MaxUsdPerDayRule
  | MaxTransactionsPerHourRule
  | RequireApprovalRule;

export interface PolicyRulesBundle {
  rules: PolicyRule[];
}

export function isPolicyRuleType(value: string): value is PolicyRuleType {
  return (POLICY_RULE_TYPES as readonly string[]).includes(value);
}

export function ruleTypeLabel(type: PolicyRuleType): string {
  switch (type) {
    case "token_allowlist":
      return "Token allowlist";
    case "wallet_allowlist":
      return "Wallet allowlist";
    case "max_usd_per_transaction":
      return "Max USD per transaction";
    case "max_usd_per_day":
      return "Max USD per day";
    case "max_transactions_per_hour":
      return "Max transactions per hour";
    case "require_approval":
      return "Require approval";
    default:
      return type;
  }
}

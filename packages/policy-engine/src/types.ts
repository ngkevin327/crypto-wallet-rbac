import type { PolicyRule } from "@wtp/shared/policy/rule-types";

export type PolicyDecisionType = "ALLOW" | "DENY" | "REQUIRE_APPROVAL";

export interface RateCounters {
  dailyUsdSpent: number;
  txCountLastHour: number;
}

export type IntentAction = "transfer" | "deploy";

export interface EvaluationContext {
  orgId: string;
  memberId: string;
  walletId: string;
  tokenAddress: string;
  chainId: number;
  amountUsd: number | null;
  counters: RateCounters;
  actorRoleIds: string[];
  intentAction?: IntentAction;
}

export interface ApprovalRequirement {
  approverCount: number;
  approverRoleIds?: string[];
}

export interface RuleEvaluationResult {
  decision: PolicyDecisionType;
  reasons: string[];
  ruleType: string;
  metadata?: Record<string, unknown>;
}

export interface PolicyDecision {
  decision: PolicyDecisionType;
  reasons: string[];
  matchedRules: PolicyRule[];
  metadata?: Record<string, unknown> & {
    approval?: ApprovalRequirement;
    remainingUsd?: number;
  };
}

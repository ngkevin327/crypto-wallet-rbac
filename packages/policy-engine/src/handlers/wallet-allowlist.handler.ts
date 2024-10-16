import type { PolicyRule, WalletAllowlistRule } from "@wtp/shared/policy/rule-types";
import { POLICY_DENIED_WALLET_NOT_ALLOWED } from "@wtp/shared/policy/reason-codes";
import type { RuleHandler } from "../rule-handler";
import type { EvaluationContext, RuleEvaluationResult } from "../types";

export class WalletAllowlistHandler implements RuleHandler {
  readonly type = "wallet_allowlist" as const;

  evaluate(context: EvaluationContext, rule: PolicyRule): RuleEvaluationResult {
    const r = rule as WalletAllowlistRule;
    if (!r.walletIds.includes(context.walletId)) {
      return {
        decision: "DENY",
        reasons: [POLICY_DENIED_WALLET_NOT_ALLOWED],
        ruleType: this.type,
      };
    }
    return { decision: "ALLOW", reasons: [], ruleType: this.type };
  }
}

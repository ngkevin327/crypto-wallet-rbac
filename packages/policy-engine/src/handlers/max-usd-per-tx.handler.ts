import type { MaxUsdPerTransactionRule, PolicyRule } from "@wtp/shared/policy/rule-types";
import {
  POLICY_DENIED_AMOUNT_UNKNOWN,
  POLICY_DENIED_EXCEEDS_PER_TX,
} from "@wtp/shared/policy/reason-codes";
import type { RuleHandler } from "../rule-handler";
import type { EvaluationContext, RuleEvaluationResult } from "../types";

export class MaxUsdPerTxHandler implements RuleHandler {
  readonly type = "max_usd_per_transaction" as const;

  evaluate(context: EvaluationContext, rule: PolicyRule): RuleEvaluationResult {
    const r = rule as MaxUsdPerTransactionRule;
    if (context.amountUsd == null) {
      return {
        decision: "DENY",
        reasons: [POLICY_DENIED_AMOUNT_UNKNOWN],
        ruleType: this.type,
      };
    }
    if (context.amountUsd > r.maxUsd) {
      return {
        decision: "DENY",
        reasons: [POLICY_DENIED_EXCEEDS_PER_TX],
        ruleType: this.type,
        metadata: { maxUsd: r.maxUsd, amountUsd: context.amountUsd },
      };
    }
    return { decision: "ALLOW", reasons: [], ruleType: this.type };
  }
}

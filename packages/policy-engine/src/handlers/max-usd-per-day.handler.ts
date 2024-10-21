import type { MaxUsdPerDayRule, PolicyRule } from "@wtp/shared/policy/rule-types";
import {
  POLICY_DENIED_AMOUNT_UNKNOWN,
  POLICY_DENIED_EXCEEDS_DAILY,
} from "@wtp/shared/policy/reason-codes";
import type { RuleHandler } from "../rule-handler";
import type { EvaluationContext, RuleEvaluationResult } from "../types";

export class MaxUsdPerDayHandler implements RuleHandler {
  readonly type = "max_usd_per_day" as const;

  evaluate(context: EvaluationContext, rule: PolicyRule): RuleEvaluationResult {
    const r = rule as MaxUsdPerDayRule;
    if (context.amountUsd == null) {
      return {
        decision: "DENY",
        reasons: [POLICY_DENIED_AMOUNT_UNKNOWN],
        ruleType: this.type,
      };
    }
    const projected = context.counters.dailyUsdSpent + context.amountUsd;
    if (projected > r.maxUsd) {
      const remainingUsd = Math.max(0, r.maxUsd - context.counters.dailyUsdSpent);
      return {
        decision: "DENY",
        reasons: [POLICY_DENIED_EXCEEDS_DAILY],
        ruleType: this.type,
        metadata: { remainingUsd, maxUsd: r.maxUsd, projected },
      };
    }
    return { decision: "ALLOW", reasons: [], ruleType: this.type };
  }
}

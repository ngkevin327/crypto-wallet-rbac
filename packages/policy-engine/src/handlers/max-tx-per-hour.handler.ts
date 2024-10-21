import type { MaxTransactionsPerHourRule, PolicyRule } from "@wtp/shared/policy/rule-types";
import { POLICY_DENIED_RATE_LIMIT } from "@wtp/shared/policy/reason-codes";
import type { RuleHandler } from "../rule-handler";
import type { EvaluationContext, RuleEvaluationResult } from "../types";

export class MaxTxPerHourHandler implements RuleHandler {
  readonly type = "max_transactions_per_hour" as const;

  evaluate(context: EvaluationContext, rule: PolicyRule): RuleEvaluationResult {
    const r = rule as MaxTransactionsPerHourRule;
    if (context.counters.txCountLastHour >= r.maxCount) {
      return {
        decision: "DENY",
        reasons: [POLICY_DENIED_RATE_LIMIT],
        ruleType: this.type,
        metadata: { maxCount: r.maxCount, current: context.counters.txCountLastHour },
      };
    }
    return { decision: "ALLOW", reasons: [], ruleType: this.type };
  }
}

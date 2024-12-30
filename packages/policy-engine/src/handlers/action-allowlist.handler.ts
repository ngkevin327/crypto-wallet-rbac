import type { ActionAllowlistRule, PolicyRule } from "@wtp/shared/policy/rule-types";
import { ACTION_NOT_ALLOWED } from "@wtp/shared/policy/reason-codes";
import type { RuleHandler } from "../rule-handler";
import type { EvaluationContext, RuleEvaluationResult } from "../types";

export class ActionAllowlistHandler implements RuleHandler {
  readonly type = "action_allowlist" as const;

  evaluate(context: EvaluationContext, rule: PolicyRule): RuleEvaluationResult {
    const r = rule as ActionAllowlistRule;
    const action = context.intentAction ?? "transfer";
    if (!r.actions.includes(action)) {
      return {
        decision: "DENY",
        reasons: [ACTION_NOT_ALLOWED],
        ruleType: this.type,
      };
    }
    return { decision: "ALLOW", reasons: [], ruleType: this.type };
  }
}

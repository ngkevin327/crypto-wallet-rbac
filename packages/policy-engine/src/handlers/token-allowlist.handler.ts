import type { PolicyRule, TokenAllowlistRule } from "@wtp/shared/policy/rule-types";
import { POLICY_DENIED_TOKEN_NOT_ALLOWED } from "@wtp/shared/policy/reason-codes";
import type { RuleHandler } from "../rule-handler";
import type { EvaluationContext, RuleEvaluationResult } from "../types";

export class TokenAllowlistHandler implements RuleHandler {
  readonly type = "token_allowlist" as const;

  evaluate(context: EvaluationContext, rule: PolicyRule): RuleEvaluationResult {
    const r = rule as TokenAllowlistRule;
    const normalized = context.tokenAddress.toLowerCase();
    const allowed = r.addresses.map((a) => a.toLowerCase());
    if (!allowed.includes(normalized)) {
      return {
        decision: "DENY",
        reasons: [POLICY_DENIED_TOKEN_NOT_ALLOWED],
        ruleType: this.type,
      };
    }
    return { decision: "ALLOW", reasons: [], ruleType: this.type };
  }
}

import type { PolicyRule, RequireApprovalRule } from "@wtp/shared/policy/rule-types";
import { POLICY_DENIED_APPROVAL_REQUIRED } from "@wtp/shared/policy/reason-codes";
import type { RuleHandler } from "../rule-handler";
import type { EvaluationContext, RuleEvaluationResult } from "../types";

export class RequireApprovalHandler implements RuleHandler {
  readonly type = "require_approval" as const;

  evaluate(context: EvaluationContext, rule: PolicyRule): RuleEvaluationResult {
    const r = rule as RequireApprovalRule;
    if (context.amountUsd == null || context.amountUsd <= 0) {
      return { decision: "ALLOW", reasons: [], ruleType: this.type };
    }

    return {
      decision: "REQUIRE_APPROVAL",
      reasons: [POLICY_DENIED_APPROVAL_REQUIRED],
      ruleType: this.type,
      metadata: {
        approval: {
          approverCount: r.approverCount,
          approverRoleIds: r.approverRoleIds,
        },
      },
    };
  }
}

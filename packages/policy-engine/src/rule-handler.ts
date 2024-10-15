import type { PolicyRule } from "@wtp/shared/policy/rule-types";
import type { EvaluationContext, RuleEvaluationResult } from "./types";

export interface RuleHandler {
  readonly type: PolicyRule["type"];
  evaluate(context: EvaluationContext, rule: PolicyRule): RuleEvaluationResult;
}

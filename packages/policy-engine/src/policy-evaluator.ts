import type { PolicyRule } from "@wtp/shared/policy/rule-types";
import { mergeResults } from "./merge-strategy";
import { createDefaultRegistry } from "./register-handlers";
import type { EvaluationContext, PolicyDecision } from "./types";

export class PolicyEvaluator {
  private readonly registry = createDefaultRegistry();

  evaluate(context: EvaluationContext, rules: PolicyRule[]): PolicyDecision {
    if (!rules.length) {
      return { decision: "ALLOW", reasons: [], matchedRules: [] };
    }

    const results = rules.map((rule) => {
      const handler = this.registry.getHandler(rule);
      if (!handler) {
        return {
          decision: "DENY" as const,
          reasons: [`UNKNOWN_RULE_TYPE:${rule.type}`],
          ruleType: rule.type,
        };
      }
      return handler.evaluate(context, rule);
    });

    return mergeResults(results, rules);
  }
}

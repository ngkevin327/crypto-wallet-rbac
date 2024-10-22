import type { PolicyRule } from "@wtp/shared/policy/rule-types";
import type { ApprovalRequirement, PolicyDecision, RuleEvaluationResult } from "./types";

export function mergeResults(
  results: RuleEvaluationResult[],
  rules: PolicyRule[]
): PolicyDecision {
  const deny = results.find((r) => r.decision === "DENY");
  if (deny) {
    return {
      decision: "DENY",
      reasons: results.flatMap((r) => r.reasons),
      matchedRules: rules,
      metadata: deny.metadata,
    };
  }

  const matchedRules: PolicyRule[] = [];
  const reasons: string[] = [];
  let approval: ApprovalRequirement | undefined;

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const rule = rules[i];
    if (!rule) {
      continue;
    }
    matchedRules.push(rule);
    reasons.push(...result.reasons);

    if (result.decision === "REQUIRE_APPROVAL") {
      const meta = result.metadata?.approval as ApprovalRequirement | undefined;
      if (meta) {
        approval = pickStricterApproval(approval, meta);
      }
    }
  }

  if (approval) {
    return {
      decision: "REQUIRE_APPROVAL",
      reasons,
      matchedRules,
      metadata: { approval },
    };
  }

  return { decision: "ALLOW", reasons, matchedRules };
}

function pickStricterApproval(
  current: ApprovalRequirement | undefined,
  next: ApprovalRequirement
): ApprovalRequirement {
  if (!current) {
    return next;
  }
  return {
    approverCount: Math.max(current.approverCount, next.approverCount),
    approverRoleIds: next.approverRoleIds ?? current.approverRoleIds,
  };
}

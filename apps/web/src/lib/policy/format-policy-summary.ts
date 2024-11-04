import type { PolicyRule } from "@wtp/shared/policy/rule-types";

export function formatPolicySummary(rules: PolicyRule[]): string {
  const parts: string[] = [];

  const tokenRule = rules.find((r) => r.type === "token_allowlist");
  if (tokenRule && tokenRule.type === "token_allowlist") {
    parts.push(`USDC and ${tokenRule.addresses.length} allowed token(s)`);
  }

  const daily = rules.find((r) => r.type === "max_usd_per_day");
  if (daily && daily.type === "max_usd_per_day") {
    parts.push(`Up to $${daily.maxUsd.toLocaleString()} per day`);
  }

  const perTx = rules.find((r) => r.type === "max_usd_per_transaction");
  if (perTx && perTx.type === "max_usd_per_transaction") {
    parts.push(`Max $${perTx.maxUsd.toLocaleString()} per transaction`);
  }

  const approval = rules.find((r) => r.type === "require_approval");
  if (approval && approval.type === "require_approval") {
    parts.push(`Requires ${approval.approverCount} approval(s)`);
  }

  if (!parts.length) {
    return "No spending rules configured";
  }

  return parts.join(" · ");
}

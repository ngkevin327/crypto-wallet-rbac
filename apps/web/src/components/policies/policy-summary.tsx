"use client";

import type { PolicyRule } from "@wtp/shared/policy/rule-types";
import { formatPolicySummary } from "@/lib/policy/format-policy-summary";

interface Props {
  rules: PolicyRule[];
  className?: string;
}

export function PolicySummary({ rules, className = "" }: Props) {
  return (
    <p className={`text-sm text-slate-400 ${className}`}>{formatPolicySummary(rules)}</p>
  );
}

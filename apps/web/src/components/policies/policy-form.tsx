"use client";

import { useState } from "react";
import type { PolicyRule } from "@wtp/shared/policy/rule-types";
import { SpendingLimitFields } from "./rule-fields/spending-limit-fields";
import { TokenAllowlistField } from "./rule-fields/token-allowlist-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface Props {
  initialRules?: PolicyRule[];
  onSubmit: (rules: PolicyRule[]) => Promise<void>;
}

export function PolicyForm({ initialRules: _initialRules, onSubmit }: Props) {
  const [tokenAddress, setTokenAddress] = useState(
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
  );
  const [dailyLimit, setDailyLimit] = useState("2000");
  const [perTxLimit, setPerTxLimit] = useState("");
  const [approverCount, setApproverCount] = useState("2");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function buildRules(): PolicyRule[] {
    const rules: PolicyRule[] = [
      { type: "token_allowlist", addresses: [tokenAddress] },
      { type: "max_usd_per_day", maxUsd: Number(dailyLimit) },
    ];
    if (perTxLimit) {
      rules.push({ type: "max_usd_per_transaction", maxUsd: Number(perTxLimit) });
    }
    if (Number(approverCount) > 0) {
      rules.push({ type: "require_approval", approverCount: Number(approverCount) });
    }
    return rules;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!tokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError("Invalid token address");
      return;
    }
    if (Number(dailyLimit) <= 0) {
      setError("Daily limit must be greater than zero");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(buildRules());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save policy");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6" data-testid="policy-form">
      <TokenAllowlistField value={tokenAddress} onChange={setTokenAddress} />
      <SpendingLimitFields
        dailyLimit={dailyLimit}
        perTxLimit={perTxLimit}
        onDailyChange={setDailyLimit}
        onPerTxChange={setPerTxLimit}
      />
      <Input
        label="Required approvers"
        data-testid="policy-approver-count"
        type="number"
        min={0}
        value={approverCount}
        onChange={(e) => setApproverCount(e.target.value)}
      />
      {error && <Alert variant="error">{error}</Alert>}
      <Button type="submit" data-testid="policy-save" disabled={saving}>
        {saving ? "Saving…" : "Save policy"}
      </Button>
    </form>
  );
}

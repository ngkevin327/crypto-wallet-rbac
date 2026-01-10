"use client";

import type { IntentRecord } from "@/lib/api/intents";
import { explorerTxUrl } from "@/lib/safe/confirm-transaction";
import { cn } from "@/lib/cn";
import { TextLink } from "@/components/ui/link";

const STEPS = [
  { key: "created", label: "Created" },
  { key: "policy", label: "Policy" },
  { key: "approval", label: "Approval" },
  { key: "proposed", label: "Proposed" },
  { key: "signed", label: "Signed" },
  { key: "executed", label: "Executed" },
] as const;

function stepIndex(status: string): number {
  if (status === "denied") return 1;
  if (status === "pending_approval") return 2;
  if (status === "ready_to_sign") return 3;
  if (status === "submitted") return 4;
  if (status === "executed") return 5;
  if (status === "failed" || status === "cancelled") return 5;
  return 0;
}

export function IntentStatusTimeline({ intent }: { intent: IntentRecord }) {
  const active = stepIndex(intent.status);
  const decision = intent.policyDecision as { decision?: string; reasons?: string[] };

  return (
    <ol className="space-y-4 border-l border-surface-border pl-4">
      {STEPS.map((step, i) => (
        <li key={step.key} className="relative">
          <span
            className={cn(
              "absolute -left-[21px] h-2.5 w-2.5 rounded-full",
              i <= active ? "bg-brand-500 ring-2 ring-brand-500/30" : "bg-slate-600"
            )}
          />
          <p className={cn("text-sm", i <= active ? "text-white" : "text-slate-500")}>
            {step.label}
          </p>
          {step.key === "policy" && decision.decision === "DENY" && (
            <p className="mt-1 text-xs text-red-400">
              {(decision.reasons ?? []).join(", ")}
            </p>
          )}
        </li>
      ))}
      {intent.txHash && (
        <li>
          <TextLink href={explorerTxUrl(intent.chainId, intent.txHash)} className="text-xs">
            View on explorer →
          </TextLink>
        </li>
      )}
    </ol>
  );
}

"use client";

import { use } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useIntentStatus } from "@/hooks/use-intent-status";
import { IntentStatusTimeline } from "@/components/intents/intent-status-timeline";
import { SignTransactionButton } from "@/components/intents/sign-transaction-button";

export default function IntentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { token } = useAuth();
  const { intent, error, refresh } = useIntentStatus(token, id);

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }
  if (!intent) {
    return <p className="text-slate-400">Loading intent…</p>;
  }

  const canSign =
    intent.status === "ready_to_sign" || intent.status === "submitted";

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Transfer intent</h1>
        <p className="text-sm text-slate-500 mt-1 font-mono">{intent.id}</p>
        <p className="text-sm text-slate-400 mt-2 capitalize">Status: {intent.status}</p>
      </div>

      <IntentStatusTimeline intent={intent} />

      {canSign && token && (
        <SignTransactionButton
          token={token}
          intentId={intent.id}
          senderAddress="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
          onProposed={() => void refresh()}
        />
      )}

      {intent.txHash && (
        <p className="text-xs font-mono text-slate-500 break-all">{intent.txHash}</p>
      )}
    </div>
  );
}

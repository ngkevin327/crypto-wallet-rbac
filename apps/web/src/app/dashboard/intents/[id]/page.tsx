"use client";

import { use } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useIntentStatus } from "@/hooks/use-intent-status";
import { IntentStatusTimeline } from "@/components/intents/intent-status-timeline";
import { SignTransactionButton } from "@/components/intents/sign-transaction-button";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { LoadingState } from "@/components/ui/loading";

export default function IntentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { token } = useAuth();
  const { intent, error, refresh } = useIntentStatus(token, id);

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }
  if (!intent) {
    return <LoadingState message="Loading intent…" />;
  }

  const canSign = intent.status === "ready_to_sign" || intent.status === "submitted";

  return (
    <div className="max-w-2xl space-y-8">
      <PageHeader
        title="Transfer intent"
        description={intent.id}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={intent.status === "executed" ? "active" : "pending"}>{intent.status}</Badge>
      </div>

      <Card>
        <CardHeader title="Status timeline" description="Policy, approval, and on-chain progress" />
        <CardBody className="pt-2">
          <IntentStatusTimeline intent={intent} />
        </CardBody>
      </Card>

      {canSign && token && (
        <Card glow>
          <CardHeader title="Sign with Safe" description="Propose transaction to the Safe Transaction Service" />
          <CardBody className="pt-0">
            <SignTransactionButton
              token={token}
              intentId={intent.id}
              senderAddress="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
              onProposed={() => void refresh()}
            />
          </CardBody>
        </Card>
      )}

      {intent.txHash && (
        <p className="break-all font-mono text-xs text-slate-500">{intent.txHash}</p>
      )}
    </div>
  );
}

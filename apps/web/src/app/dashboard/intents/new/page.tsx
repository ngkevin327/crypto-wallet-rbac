"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { apiRequest } from "@/lib/api-client";
import { CreateIntentWizard } from "@/components/intents/create-intent-wizard";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading";

interface WalletRow {
  id: string;
  address: string;
  nickname?: string | null;
}

export default function NewIntentPage() {
  const { token, user } = useAuth();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [wallets, setWallets] = useState<WalletRow[]>([]);

  useEffect(() => {
    if (!token) return;
    void (async () => {
      const orgs = await apiRequest<{ id: string }[]>("/orgs", { token });
      const id = orgs[0]?.id;
      if (!id) return;
      setOrgId(id);
      const members = await apiRequest<{ id: string; userId: string }[]>(`/orgs/${id}/members`, {
        token,
      });
      const me = members.find((m) => m.userId === user?.id);
      setMemberId(me?.id ?? members[0]?.id ?? null);
      const w = await apiRequest<WalletRow[]>(`/orgs/${id}/wallets`, { token });
      setWallets(w);
    })();
  }, [token, user?.id]);

  if (!orgId || !memberId) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="New USDC transfer"
        description="Draft a payout intent and preview policy before submission."
      />
      <Card glow className="max-w-2xl">
        <CardBody>
          <CreateIntentWizard orgId={orgId} memberId={memberId} wallets={wallets} />
        </CardBody>
      </Card>
    </div>
  );
}

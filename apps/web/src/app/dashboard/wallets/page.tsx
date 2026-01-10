"use client";

import { useEffect, useState } from "react";
import { listOrgs } from "@/lib/api/orgs";
import { ConnectSafeForm } from "@/components/wallets/connect-safe-form";
import { WalletCard } from "@/components/wallets/wallet-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { IconWallet } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { LoadingState } from "@/components/ui/loading";
import { useWalletRefresh } from "@/hooks/use-wallet-refresh";
import { useAuth } from "@/providers/auth-provider";

export default function WalletsPage() {
  const { token } = useAuth();
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    listOrgs(token).then((orgs) => setOrgId(orgs[0]?.id ?? null));
  }, [token]);

  const { wallets, loading, error, refresh } = useWalletRefresh(token, orgId);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Wallets"
        description="Connect Gnosis Safe treasuries and keep owner lists in sync for policy enforcement."
      />

      {token && (
        <Card glow>
          <CardHeader title="Connect a Safe" description="Verify ownership with a one-time signature" />
          <CardBody className="pt-0">
            <ConnectSafeForm token={token} onConnected={refresh} />
          </CardBody>
        </Card>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-white">Connected Safes</h2>
        {error && <Alert variant="error">{error}</Alert>}
        {loading && <LoadingState message="Loading wallets…" />}
        {!loading && wallets.length === 0 && (
          <EmptyState
            title="No wallets connected"
            description="Connect your Gnosis Safe treasury to create transfer intents and enforce spending policies."
            actionLabel="Connect Safe above"
            actionHref="#"
            icon={<IconWallet className="h-7 w-7" />}
          />
        )}
        <div className="grid gap-5 md:grid-cols-2">
          {wallets.map((w) => (
            <WalletCard key={w.id} wallet={w} />
          ))}
        </div>
      </section>
    </div>
  );
}

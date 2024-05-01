"use client";

import { useEffect, useState } from "react";
import { listOrgs } from "@/lib/api/orgs";
import { ConnectSafeForm } from "@/components/wallets/connect-safe-form";
import { WalletCard } from "@/components/wallets/wallet-card";
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Wallets</h1>
        <p className="text-slate-400 text-sm mt-1">Connect and monitor Gnosis Safe treasuries</p>
      </div>

      {token && <ConnectSafeForm token={token} onConnected={refresh} />}

      <section>
        <h2 className="text-lg font-medium text-white mb-4">Connected Safes</h2>
        {error && <p className="text-sm text-red-400 mb-2">{error}</p>}
        {loading && <p className="text-slate-400">Loading…</p>}
        {!loading && wallets.length === 0 && (
          <p className="text-slate-500 text-sm">No wallets connected yet.</p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {wallets.map((w) => (
            <WalletCard key={w.id} wallet={w} />
          ))}
        </div>
      </section>
    </div>
  );
}

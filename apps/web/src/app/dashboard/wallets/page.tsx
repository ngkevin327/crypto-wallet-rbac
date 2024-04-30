"use client";

import { useCallback, useEffect, useState } from "react";
import { listOrgs } from "@/lib/api/orgs";
import { listWallets, type WalletRecord } from "@/lib/api/wallets";
import { ConnectSafeForm } from "@/components/wallets/connect-safe-form";
import { WalletCard } from "@/components/wallets/wallet-card";
import { useAuth } from "@/providers/auth-provider";

export default function WalletsPage() {
  const { token } = useAuth();
  const [wallets, setWallets] = useState<WalletRecord[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const orgs = await listOrgs(token);
      if (!orgs.length) {
        setWallets([]);
        return;
      }
      setOrgId(orgs[0].id);
      setWallets(await listWallets(token, orgs[0].id));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Wallets</h1>
        <p className="text-slate-400 text-sm mt-1">Connect and monitor Gnosis Safe treasuries</p>
      </div>

      {token && <ConnectSafeForm token={token} onConnected={refresh} />}

      <section>
        <h2 className="text-lg font-medium text-white mb-4">Connected Safes</h2>
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

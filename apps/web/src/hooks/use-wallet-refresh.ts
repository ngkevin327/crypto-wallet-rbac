"use client";

import { useCallback, useEffect, useState } from "react";
import { listWallets, type WalletRecord } from "@/lib/api/wallets";

const POLL_MS = 60_000;

export function useWalletRefresh(token: string | null, orgId: string | null) {
  const [wallets, setWallets] = useState<WalletRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token || !orgId) {
      setWallets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setWallets(await listWallets(token, orgId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load wallets");
    } finally {
      setLoading(false);
    }
  }, [token, orgId]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { wallets, loading, error, refresh };
}

"use client";

import type { WalletRecord } from "@/lib/api/wallets";

function chainLabel(chainId: number): string {
  if (chainId === 1) return "Mainnet";
  if (chainId === 11155111) return "Sepolia";
  return `Chain ${chainId}`;
}

function formatSynced(lastSyncedAt: string | null): string {
  if (!lastSyncedAt) return "Never synced";
  const d = new Date(lastSyncedAt);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "Synced just now";
  if (mins < 60) return `Synced ${mins}m ago`;
  return `Synced ${Math.floor(mins / 60)}h ago`;
}

interface Props {
  wallet: WalletRecord;
}

export function WalletCard({ wallet }: Props) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-white">{wallet.nickname ?? "Unnamed Safe"}</h3>
          <p className="text-xs font-mono text-slate-500 mt-1 break-all">{wallet.address}</p>
        </div>
        <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">
          {chainLabel(wallet.chainId)}
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500">Threshold</dt>
          <dd className="text-slate-200">{wallet.safeThreshold ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Sync</dt>
          <dd className="text-slate-200">{formatSynced(wallet.lastSyncedAt)}</dd>
        </div>
      </dl>
    </div>
  );
}

"use client";

import type { WalletRecord } from "@/lib/api/wallets";
import { WalletOwnersList } from "./wallet-owners-list";

function chainLabel(chainId: number): string {
  if (chainId === 1) return "Ethereum Mainnet";
  if (chainId === 11155111) return "Sepolia";
  return `Chain ${chainId}`;
}

function chainBadgeClass(chainId: number): string {
  if (chainId === 1) return "bg-amber-500/15 text-amber-300";
  if (chainId === 11155111) return "bg-violet-500/15 text-violet-300";
  return "bg-slate-500/15 text-slate-300";
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
  const syncStale =
    !wallet.lastSyncedAt ||
    Date.now() - new Date(wallet.lastSyncedAt).getTime() > 15 * 60 * 1000;

  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-medium text-white">{wallet.nickname ?? "Unnamed Safe"}</h3>
          <p className="text-xs font-mono text-slate-500 mt-1 break-all">{wallet.address}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${chainBadgeClass(wallet.chainId)}`}
        >
          {chainLabel(wallet.chainId)}
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500">Signing threshold</dt>
          <dd className="text-slate-200 font-medium">
            {wallet.safeThreshold != null
              ? `${wallet.safeThreshold} signature${wallet.safeThreshold === 1 ? "" : "s"}`
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Last sync</dt>
          <dd className={syncStale ? "text-amber-400" : "text-emerald-400"}>
            {formatSynced(wallet.lastSyncedAt)}
          </dd>
        </div>
      </dl>
      <WalletOwnersList owners={wallet.safeOwners ?? []} threshold={wallet.safeThreshold} />
    </div>
  );
}

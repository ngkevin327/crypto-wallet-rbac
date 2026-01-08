"use client";

import type { WalletRecord } from "@/lib/api/wallets";
import { WalletOwnersList } from "./wallet-owners-list";
import { Card, CardBody } from "@/components/ui/card";
import { cn } from "@/lib/cn";

function chainLabel(chainId: number): string {
  if (chainId === 1) return "Mainnet";
  if (chainId === 11155111) return "Sepolia";
  return `Chain ${chainId}`;
}

function chainBadgeClass(chainId: number): string {
  if (chainId === 1) return "bg-amber-500/15 text-amber-200 ring-amber-500/25";
  if (chainId === 11155111) return "bg-violet-500/15 text-violet-200 ring-violet-500/25";
  return "bg-slate-500/15 text-slate-300 ring-slate-500/25";
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
    <Card className="h-full">
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold text-white">
              {wallet.nickname ?? "Treasury Safe"}
            </h3>
            <p className="mt-1.5 break-all font-mono text-xs text-slate-500">{wallet.address}</p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
              chainBadgeClass(wallet.chainId)
            )}
          >
            {chainLabel(wallet.chainId)}
          </span>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-surface-overlay/60 p-3">
            <dt className="text-xs text-slate-500">Signing threshold</dt>
            <dd className="mt-1 font-display text-lg font-semibold text-white">
              {wallet.safeThreshold != null ? wallet.safeThreshold : "—"}
            </dd>
          </div>
          <div className="rounded-xl bg-surface-overlay/60 p-3">
            <dt className="text-xs text-slate-500">Last sync</dt>
            <dd className={cn("mt-1 text-sm font-medium", syncStale ? "text-amber-300" : "text-emerald-300")}>
              {formatSynced(wallet.lastSyncedAt)}
            </dd>
          </div>
        </dl>
        <WalletOwnersList owners={wallet.safeOwners ?? []} threshold={wallet.safeThreshold} />
      </CardBody>
    </Card>
  );
}

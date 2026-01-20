"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";
import { IconCheckCircle, IconSparkles } from "@/components/icons";
import { cn } from "@/lib/cn";

interface SetupStatus {
  hasWallet: boolean;
  hasTeamMember: boolean;
  hasPolicy: boolean;
  allComplete: boolean;
}

interface Props {
  token: string;
  orgId: string;
}

export function SetupChecklist({ token, orgId }: Props) {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const key = `wtp-setup-dismissed-${orgId}`;
    setDismissed(localStorage.getItem(key) === "1");
    apiRequest<SetupStatus>(`/orgs/${orgId}/setup-status`, { token }).then(setStatus);
  }, [token, orgId]);

  if (!status || dismissed || status.allComplete) {
    return null;
  }

  const steps = [
    { label: "Connect a Gnosis Safe wallet", done: status.hasWallet, href: "/dashboard/wallets" },
    { label: "Invite your first team member", done: status.hasTeamMember, href: "/dashboard/team" },
    { label: "Create a spending policy", done: status.hasPolicy, href: "/dashboard/policies" },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="rounded-xl border border-brand-500/20 bg-gradient-to-br from-brand-500/8 via-surface-raised/80 to-surface-raised/40 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/20 text-brand-300">
            <IconSparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-display text-sm font-semibold text-white">Complete your setup</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {doneCount} of {steps.length} steps done
            </p>
          </div>
        </div>
        <div className="hidden sm:flex h-1.5 w-20 overflow-hidden rounded-full bg-surface-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
      </div>
      <ul className="mt-4 space-y-1">
        {steps.map((s) => (
          <li key={s.label}>
            <Link
              href={s.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                s.done ? "text-slate-500" : "text-slate-200 hover:bg-white/5"
              )}
            >
              <IconCheckCircle
                className={cn("h-4 w-4 shrink-0", s.done ? "text-emerald-400" : "text-slate-600")}
              />
              <span className={s.done ? "line-through" : "font-medium"}>{s.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-4 text-xs text-slate-500 transition-colors hover:text-slate-300"
        onClick={() => {
          localStorage.setItem(`wtp-setup-dismissed-${orgId}`, "1");
          setDismissed(true);
        }}
      >
        Dismiss for now
      </button>
    </div>
  );
}

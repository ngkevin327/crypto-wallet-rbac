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
    <div className="rounded-2xl border border-brand-500/25 bg-gradient-to-br from-brand-500/10 via-surface-raised/80 to-surface-raised/40 p-6 shadow-glow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300">
            <IconSparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-white">Complete your setup</h2>
            <p className="mt-1 text-sm text-slate-400">
              {doneCount} of {steps.length} steps done — unlock full treasury governance
            </p>
          </div>
        </div>
        <div className="hidden sm:flex h-2 w-24 overflow-hidden rounded-full bg-surface-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
      </div>
      <ul className="mt-5 space-y-2">
        {steps.map((s) => (
          <li key={s.label}>
            <Link
              href={s.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                s.done ? "text-slate-500" : "text-slate-200 hover:bg-white/5"
              )}
            >
              <IconCheckCircle
                className={cn("h-5 w-5", s.done ? "text-emerald-400" : "text-slate-600")}
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

"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";

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
    { label: "Connect a wallet", done: status.hasWallet, href: "/dashboard/wallets" },
    { label: "Invite a team member", done: status.hasTeamMember, href: "/dashboard/team" },
    { label: "Create a spending policy", done: status.hasPolicy, href: "/dashboard/policies" },
  ];

  return (
    <div className="rounded-lg border border-accent/30 bg-accent/5 p-5 mb-8">
      <h2 className="text-sm font-semibold text-white mb-3">Getting started</h2>
      <ul className="space-y-2">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            <span className={s.done ? "text-emerald-400" : "text-slate-500"}>
              {s.done ? "✓" : "○"}
            </span>
            <a href={s.href} className="text-slate-300 hover:text-white">
              {s.label}
            </a>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-4 text-xs text-slate-500 hover:text-slate-300"
        onClick={() => {
          localStorage.setItem(`wtp-setup-dismissed-${orgId}`, "1");
          setDismissed(true);
        }}
      >
        Dismiss checklist
      </button>
    </div>
  );
}

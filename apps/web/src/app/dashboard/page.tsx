"use client";

import { useEffect, useState } from "react";
import { listOrgs } from "@/lib/api/orgs";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { useAuth } from "@/providers/auth-provider";

export default function DashboardPage() {
  const { user, token, loading } = useAuth();
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    listOrgs(token).then((orgs) => setOrgId(orgs[0]?.id ?? null));
  }, [token]);

  if (loading) {
    return <p className="text-slate-400">Loading…</p>;
  }

  return (
    <div>
      {token && orgId && <SetupChecklist token={token} orgId={orgId} />}
      <h1 className="text-2xl font-semibold text-white mb-2">Dashboard</h1>
      <p className="text-slate-400 mb-8">
        Welcome{user ? `, ${user.email}` : ""}. Connect your first Safe to get started.
      </p>
      <div className="rounded-lg border border-dashed border-surface-border p-12 text-center">
        <h2 className="text-lg font-medium text-slate-200 mb-2">Connect your first Safe</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Link a Gnosis Safe treasury wallet to define roles, spending limits, and approval
          workflows for your team.
        </p>
        <a
          href="/dashboard/wallets"
          className="inline-block mt-6 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-muted"
        >
          Go to Wallets
        </a>
      </div>
    </div>
  );
}

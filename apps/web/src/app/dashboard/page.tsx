"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listOrgs } from "@/lib/api/orgs";
import { getDashboardSummary, type DashboardSummary } from "@/lib/api/dashboard";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import { useAuth } from "@/providers/auth-provider";

export default function DashboardPage() {
  const { user, token, loading } = useAuth();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    if (!token) return;
    listOrgs(token).then(async (orgs) => {
      const id = orgs[0]?.id ?? null;
      setOrgId(id);
      if (id) {
        setSummary(await getDashboardSummary(token, id));
      }
    });
  }, [token]);

  if (loading) {
    return <p className="text-slate-400">Loading…</p>;
  }

  return (
    <div className="space-y-8">
      {token && orgId && <SetupChecklist token={token} orgId={orgId} />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-1">Dashboard</h1>
          <p className="text-slate-400 text-sm">
            Welcome{user ? `, ${user.email}` : ""}.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/intents/new"
            className="rounded-md bg-accent px-4 py-2 text-sm text-white"
          >
            Create intent
          </Link>
          <Link
            href="/dashboard/approvals"
            className="rounded-md border border-surface-border px-4 py-2 text-sm text-slate-200"
          >
            Review approvals
          </Link>
        </div>
      </div>

      {summary && (
        <>
          <StatsCards
            pendingApprovals={summary.pendingApprovals}
            intentsLast24h={summary.intentsLast24h}
            policyDenials24h={summary.policyDenials24h}
          />
          <section>
            <h2 className="text-lg font-medium text-white mb-3">Recent activity</h2>
            <RecentActivityFeed events={summary.recentActivity} />
          </section>
        </>
      )}
    </div>
  );
}

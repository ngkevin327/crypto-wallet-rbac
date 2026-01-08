"use client";

import { useEffect, useState } from "react";
import { listOrgs } from "@/lib/api/orgs";
import { getDashboardSummary, type DashboardSummary } from "@/lib/api/dashboard";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
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
    return (
      <div className="flex items-center gap-3 text-slate-400">
        <span className="h-5 w-5 animate-pulse rounded-full bg-brand-500/30" />
        Loading your workspace…
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {token && orgId && <SetupChecklist token={token} orgId={orgId} />}

      <PageHeader
        title="Dashboard"
        description={
          user
            ? `Good to see you, ${user.email.split("@")[0]}. Here's what's happening across your treasury.`
            : "Overview of approvals, intents, and policy activity."
        }
        actions={[
          { label: "New transfer", href: "/dashboard/intents/new", variant: "primary" },
          { label: "Review approvals", href: "/dashboard/approvals", variant: "secondary" },
        ]}
      />

      {summary && (
        <>
          <StatsCards
            pendingApprovals={summary.pendingApprovals}
            intentsLast24h={summary.intentsLast24h}
            policyDenials24h={summary.policyDenials24h}
          />
          <Card>
            <CardHeader title="Recent activity" description="Latest policy and approval events" />
            <CardBody className="pt-0">
              <RecentActivityFeed events={summary.recentActivity} />
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}

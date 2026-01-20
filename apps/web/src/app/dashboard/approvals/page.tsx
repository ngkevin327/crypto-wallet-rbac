"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useActiveOrg } from "@/hooks/use-active-org";
import { useApprovals } from "@/hooks/use-approvals";
import { ApprovalInboxTable } from "@/components/approvals/approval-inbox-table";
import { ApprovalActions } from "@/components/approvals/approval-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState } from "@/components/ui/loading";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardBody } from "@/components/ui/card";
import { IconCheckCircle } from "@/components/icons";
import type { ApprovalRecord } from "@/lib/api/approvals";

type Tab = "pending" | "fulfilled" | "rejected";

export default function ApprovalsPage() {
  const { token } = useAuth();
  const { orgId, loading: orgLoading } = useActiveOrg(token);

  if (!token || orgLoading || !orgId) {
    return <LoadingState message="Loading approvals…" />;
  }

  return <ApprovalsInbox token={token} orgId={orgId} />;
}

function ApprovalsInbox({ token, orgId }: { token: string; orgId: string }) {
  const [tab, setTab] = useState<Tab>("pending");
  const [selected, setSelected] = useState<ApprovalRecord | null>(null);
  const { items, loading, refresh } = useApprovals(token, orgId, tab, true);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Approvals"
        description="Review transfer requests that exceed policy limits or require multi-party sign-off."
      />

      <Tabs
        tabs={[
          { id: "pending" as Tab, label: "Pending" },
          { id: "fulfilled" as Tab, label: "Approved" },
          { id: "rejected" as Tab, label: "Rejected" },
        ]}
        active={tab}
        onChange={(t) => {
          setTab(t);
          setSelected(null);
        }}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-slate-500">Loading approvals…</p>
          ) : !items.length ? (
            <EmptyState
              title={tab === "pending" ? "Inbox zero" : `No ${tab} approvals`}
              description={
                tab === "pending"
                  ? "When a transfer needs your review it will appear here with quorum details."
                  : "Completed requests are listed in this tab."
              }
              icon={<IconCheckCircle className="h-7 w-7" />}
            />
          ) : (
            <ApprovalInboxTable items={items} onSelect={setSelected} />
          )}
        </div>
        {selected && tab === "pending" && (
          <Card className="h-fit lg:sticky lg:top-24">
            <CardBody className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Selected request</p>
                <p className="mt-1 font-mono text-sm text-white">{selected.id.slice(0, 12)}…</p>
              </div>
              <ApprovalActions
                token={token}
                requestId={selected.id}
                onDone={() => {
                  setSelected(null);
                  void refresh();
                }}
              />
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

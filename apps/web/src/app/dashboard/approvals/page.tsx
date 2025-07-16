"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { apiRequest } from "@/lib/api-client";
import { useApprovals } from "@/hooks/use-approvals";
import { ApprovalInboxTable } from "@/components/approvals/approval-inbox-table";
import { ApprovalActions } from "@/components/approvals/approval-actions";
import { EmptyState } from "@/components/ui/empty-state";
import type { ApprovalRecord } from "@/lib/api/approvals";

type Tab = "pending" | "fulfilled" | "rejected";

export default function ApprovalsPage() {
  const { token } = useAuth();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("pending");
  const [selected, setSelected] = useState<ApprovalRecord | null>(null);
  const { items, loading, refresh } = useApprovals(token, orgId ?? "", tab);

  useEffect(() => {
    if (!token) return;
    void apiRequest<{ id: string }[]>("/orgs", { token }).then((orgs) => {
      setOrgId(orgs[0]?.id ?? null);
    });
  }, [token]);

  if (!orgId) {
    return <p className="text-slate-400">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-white" id="approvals-heading">
        Approvals inbox
      </h1>
      <div className="flex gap-2">
        {(["pending", "fulfilled", "rejected"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setSelected(null);
            }}
            className={`rounded-md px-3 py-1.5 text-sm capitalize ${
              tab === t ? "bg-accent/20 text-accent" : "text-slate-400 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-slate-500">Loading…</p>
          ) : !items.length ? (
            <EmptyState
              title={tab === "pending" ? "No pending approvals" : `No ${tab} approvals`}
              description={
                tab === "pending"
                  ? "When a transfer needs your review it will appear here."
                  : "Completed requests are listed in this tab."
              }
            />
          ) : (
            <ApprovalInboxTable items={items} onSelect={setSelected} />
          )}
        </div>
        {selected && tab === "pending" && token && (
          <aside className="rounded-lg border border-surface-border p-4 space-y-4">
            <p className="text-sm text-white">Request {selected.id.slice(0, 8)}…</p>
            <ApprovalActions
              token={token}
              requestId={selected.id}
              onDone={() => {
                setSelected(null);
                void refresh();
              }}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

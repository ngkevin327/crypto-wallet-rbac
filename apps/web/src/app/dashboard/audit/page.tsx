"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { apiRequest } from "@/lib/api-client";
import { useAuditEvents } from "@/hooks/use-audit-events";
import { AuditFilters } from "@/components/audit/audit-filters";
import { AuditLogTable } from "@/components/audit/audit-log-table";
import { startAuditExport } from "@/lib/api/audit";

export default function AuditPage() {
  const { token } = useAuth();
  const [orgId, setOrgId] = useState("");
  const [filters, setFilters] = useState({ eventType: "", from: "", to: "" });
  const { items, loading, loadMore, hasMore } = useAuditEvents(token, orgId, filters);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    void apiRequest<{ id: string }[]>("/orgs", { token }).then((orgs) => {
      setOrgId(orgs[0]?.id ?? "");
    });
  }, [token]);

  async function handleExport() {
    if (!token || !orgId) return;
    setExportMsg(null);
    try {
      const from = filters.from || new Date(Date.now() - 7 * 86400000).toISOString();
      const to = filters.to || new Date().toISOString();
      const job = await startAuditExport(token, orgId, from, to);
      setExportMsg(`Export job started: ${job.jobId}`);
    } catch (e) {
      setExportMsg(e instanceof Error ? e.message : "Export failed");
    }
  }

  if (!orgId) {
    return <p className="text-slate-400">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Audit log</h1>
        <button
          type="button"
          onClick={() => void handleExport()}
          className="rounded-md border border-surface-border px-4 py-2 text-sm text-slate-200 hover:bg-surface"
        >
          Export CSV
        </button>
      </div>
      <AuditFilters {...filters} onChange={setFilters} />
      {exportMsg && <p className="text-sm text-slate-400">{exportMsg}</p>}
      <AuditLogTable
        items={items}
        loading={loading}
        onLoadMore={loadMore}
        hasMore={hasMore}
      />
    </div>
  );
}

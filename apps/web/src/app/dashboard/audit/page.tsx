"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useActiveOrg } from "@/hooks/use-active-org";
import { useAuditEvents } from "@/hooks/use-audit-events";
import { AuditFilters } from "@/components/audit/audit-filters";
import { AuditLogTable } from "@/components/audit/audit-log-table";
import { startAuditExport } from "@/lib/api/audit";
import { PageHeader } from "@/components/ui/page-header";
import { Alert } from "@/components/ui/alert";
import { LoadingState } from "@/components/ui/loading";
import { Card, CardBody } from "@/components/ui/card";

export default function AuditPage() {
  const { token } = useAuth();
  const { orgId, loading: orgLoading } = useActiveOrg(token);
  const [filters, setFilters] = useState({ eventType: "", from: "", to: "" });
  const { items, loading, loadMore, hasMore } = useAuditEvents(token, orgId, filters);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

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

  if (orgLoading || !orgId) {
    return <LoadingState message="Loading audit log…" />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Audit log"
        description="Immutable record of policy changes, approvals, and signing events."
        actions={[{ label: "Export CSV", onClick: () => void handleExport(), variant: "secondary" }]}
      />

      <Card>
        <CardBody>
          <AuditFilters {...filters} onChange={setFilters} />
        </CardBody>
      </Card>

      {exportMsg && <Alert variant="info">{exportMsg}</Alert>}

      <AuditLogTable items={items} loading={loading} onLoadMore={loadMore} hasMore={hasMore} />
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { listApprovals, type ApprovalRecord } from "@/lib/api/approvals";

function isValidOrgId(orgId: string | null | undefined): orgId is string {
  return typeof orgId === "string" && orgId.trim().length > 0;
}

export function useApprovals(
  token: string | null,
  orgId: string | null,
  status = "pending",
  enabled = true
) {
  const [items, setItems] = useState<ApprovalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const canFetch = enabled && !!token && isValidOrgId(orgId);

  const refresh = useCallback(async () => {
    if (!canFetch) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await listApprovals(token!, orgId, status);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [canFetch, token, orgId, status]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, loading, refresh };
}

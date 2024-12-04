"use client";

import { useCallback, useEffect, useState } from "react";
import { listApprovals, type ApprovalRecord } from "@/lib/api/approvals";

export function useApprovals(token: string | null, orgId: string, status = "pending") {
  const [items, setItems] = useState<ApprovalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await listApprovals(token, orgId, status);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [token, orgId, status]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, loading, refresh };
}

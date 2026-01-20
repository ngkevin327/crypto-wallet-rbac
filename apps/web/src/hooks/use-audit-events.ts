"use client";

import { useCallback, useEffect, useState } from "react";
import { queryAuditEvents, type AuditEventRow } from "@/lib/api/audit";

export function useAuditEvents(
  token: string | null,
  orgId: string | null,
  filters: { eventType?: string; from?: string; to?: string }
) {
  const [items, setItems] = useState<AuditEventRow[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (append = false) => {
      if (!token || !orgId) {
        if (!append) {
          setItems([]);
          setCursor(null);
        }
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const params: Record<string, string> = { limit: "50" };
        if (filters.eventType) params.eventType = filters.eventType;
        if (filters.from) params.from = filters.from;
        if (filters.to) params.to = filters.to;
        if (append && cursor) params.cursor = cursor;
        const res = await queryAuditEvents(token, orgId, params);
        setItems((prev) => (append ? [...prev, ...res.items] : res.items));
        setCursor(res.nextCursor);
      } finally {
        setLoading(false);
      }
    },
    [token, orgId, filters, cursor]
  );

  useEffect(() => {
    void load(false);
  }, [token, orgId, filters.eventType, filters.from, filters.to]);

  return { items, loading, loadMore: () => load(true), hasMore: !!cursor };
}

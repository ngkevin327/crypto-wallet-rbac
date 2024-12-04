"use client";

import { useCallback, useEffect, useState } from "react";
import { getIntent, type IntentRecord } from "@/lib/api/intents";

export function useIntentStatus(token: string | null, intentId: string, intervalMs = 5000) {
  const [intent, setIntent] = useState<IntentRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getIntent(token, intentId);
      setIntent(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load intent");
    }
  }, [token, intentId]);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  return { intent, error, refresh };
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { listPolicies, listRoles, type PolicyRecord, type RoleRecord } from "@/lib/api/policies";

export function usePolicies(token: string | null, orgId: string | null) {
  const [policies, setPolicies] = useState<PolicyRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token || !orgId) {
      setPolicies([]);
      setRoles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [p, r] = await Promise.all([listPolicies(token, orgId), listRoles(token, orgId)]);
      setPolicies(p);
      setRoles(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load policies");
    } finally {
      setLoading(false);
    }
  }, [token, orgId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { policies, roles, loading, error, refresh };
}

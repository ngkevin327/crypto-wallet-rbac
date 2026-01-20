"use client";

import { useEffect, useState } from "react";
import { createOrg, listOrgs } from "@/lib/api/orgs";

/** Resolves the user's primary org, creating a default workspace if none exists. */
export function useActiveOrg(token: string | null) {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (!token) {
      setOrgId(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        let orgs = await listOrgs(token);
        if (orgs.length === 0) {
          orgs = [await createOrg(token, "My Organization")];
        }
        const id = orgs[0]?.id?.trim();
        if (!cancelled) {
          setOrgId(id || null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return { orgId, loading };
}

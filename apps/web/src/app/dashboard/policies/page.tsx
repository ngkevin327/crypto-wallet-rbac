"use client";

import { useEffect, useState } from "react";
import { listOrgs } from "@/lib/api/orgs";
import { PolicyRoleGroup } from "@/components/policies/policy-role-group";
import { EmptyState } from "@/components/ui/empty-state";
import { usePolicies } from "@/hooks/use-policies";
import { useAuth } from "@/providers/auth-provider";

export default function PoliciesPage() {
  const { token } = useAuth();
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    listOrgs(token).then((orgs) => setOrgId(orgs[0]?.id ?? null));
  }, [token]);

  const { policies, roles, loading, error } = usePolicies(token, orgId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Policies</h1>
        <p className="text-slate-400 text-sm mt-1">Spending rules grouped by role template</p>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {loading && <p className="text-slate-400">Loading…</p>}
      {!loading && policies.length === 0 && (
        <EmptyState
          title="No policies configured"
          description="Role templates include default spending rules after you invite team members."
        />
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {roles.map((role) => (
          <PolicyRoleGroup
            key={role.id}
            role={role}
            policies={policies.filter((p) => p.roleId === role.id)}
          />
        ))}
      </div>
    </div>
  );
}

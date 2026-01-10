"use client";

import { useEffect, useState } from "react";
import { listOrgs } from "@/lib/api/orgs";
import { PolicyRoleGroup } from "@/components/policies/policy-role-group";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState } from "@/components/ui/loading";
import { Alert } from "@/components/ui/alert";
import { IconShield } from "@/components/icons";
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
    <div className="space-y-8">
      <PageHeader
        title="Policies"
        description="Spending limits and approval rules grouped by role template."
      />
      {error && <Alert variant="error">{error}</Alert>}
      {loading && <LoadingState />}
      {!loading && policies.length === 0 && (
        <EmptyState
          title="No policies configured"
          description="Role templates include default spending rules after you invite team members."
          icon={<IconShield className="h-7 w-7" />}
        />
      )}
      <div className="grid gap-5 md:grid-cols-2">
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

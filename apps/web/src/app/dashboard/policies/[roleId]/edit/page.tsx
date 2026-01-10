"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { listOrgs } from "@/lib/api/orgs";
import { createPolicy, listPolicies } from "@/lib/api/policies";
import { PolicyForm } from "@/components/policies/policy-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import type { PolicyRule } from "@wtp/shared/policy/rule-types";

export default function EditPolicyPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const roleId = params.roleId as string;
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    listOrgs(token).then((orgs) => setOrgId(orgs[0]?.id ?? null));
  }, [token]);

  async function handleSubmit(rules: PolicyRule[]) {
    if (!token || !orgId) return;
    const existing = await listPolicies(token, orgId);
    const hasActive = existing.some((p) => p.roleId === roleId && p.status === "active");
    if (hasActive) {
      const active = existing.find((p) => p.roleId === roleId && p.status === "active")!;
      const { updatePolicy } = await import("@/lib/api/policies");
      await updatePolicy(token, active.id, rules);
    } else {
      await createPolicy(token, orgId, roleId, rules);
    }
    router.push("/dashboard/policies");
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader
        title="Edit role policy"
        description="Configure spending limits, token allowlists, and approval thresholds."
      />
      <Card glow>
        <CardBody>
          <PolicyForm onSubmit={handleSubmit} />
        </CardBody>
      </Card>
    </div>
  );
}

"use client";

import type { PolicyRecord, RoleRecord } from "@/lib/api/policies";
import { PolicySummary } from "./policy-summary";
import { Card, CardBody } from "@/components/ui/card";
import { TextLink } from "@/components/ui/link";

interface Props {
  role: RoleRecord;
  policies: PolicyRecord[];
}

export function PolicyRoleGroup({ role, policies }: Props) {
  const active = policies.filter((p) => p.status === "active");
  const latest = active[0];

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">{role.name}</h3>
            <p className="mt-1 text-xs capitalize text-slate-500">{role.templateType}</p>
          </div>
          <TextLink href={`/dashboard/policies/${role.id}/edit`}>
            {latest ? "Edit policy" : "Create policy"}
          </TextLink>
        </div>
        {latest ? (
          <div className="mt-4">
            <PolicySummary rules={latest.rules} />
            <p className="mt-2 text-xs text-slate-600">
              v{latest.version} · updated {new Date(latest.updatedAt).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No active policy for this role.</p>
        )}
      </CardBody>
    </Card>
  );
}

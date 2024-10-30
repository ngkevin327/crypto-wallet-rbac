"use client";

import Link from "next/link";
import type { PolicyRecord, RoleRecord } from "@/lib/api/policies";
import { PolicySummary } from "./policy-summary";

interface Props {
  role: RoleRecord;
  policies: PolicyRecord[];
}

export function PolicyRoleGroup({ role, policies }: Props) {
  const active = policies.filter((p) => p.status === "active");
  const latest = active[0];

  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-medium text-white">{role.name}</h3>
          <p className="text-xs text-slate-500 mt-1 capitalize">{role.templateType}</p>
        </div>
        <Link
          href={`/dashboard/policies/${role.id}/edit`}
          className="text-sm text-accent hover:underline"
        >
          {latest ? "Edit policy" : "Create policy"}
        </Link>
      </div>
      {latest ? (
        <div className="mt-4">
          <PolicySummary rules={latest.rules} />
          <p className="text-xs text-slate-600 mt-2">
            v{latest.version} · updated {new Date(latest.updatedAt).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <p className="text-sm text-slate-500 mt-4">No active policy for this role.</p>
      )}
    </div>
  );
}

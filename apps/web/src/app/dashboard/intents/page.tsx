"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listOrgs } from "@/lib/api/orgs";
import { listIntents, type IntentRecord } from "@/lib/api/intents";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconSend } from "@/components/icons";
import { useAuth } from "@/providers/auth-provider";

export default function IntentsListPage() {
  const { token } = useAuth();
  const [intents, setIntents] = useState<IntentRecord[]>([]);

  useEffect(() => {
    if (!token) return;
    void (async () => {
      const orgs = await listOrgs(token);
      const orgId = orgs[0]?.id;
      if (orgId) {
        setIntents(await listIntents(token, orgId));
      }
    })();
  }, [token]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Transfer intents"
        description="Track USDC payout requests through policy checks and approvals."
        actions={[{ label: "New transfer", href: "/dashboard/intents/new" }]}
      />
      {!intents.length ? (
        <EmptyState
          title="No transfer intents yet"
          description="Create a USDC payout intent to start the approval workflow."
          actionLabel="Create intent"
          actionHref="/dashboard/intents/new"
          icon={<IconSend className="h-7 w-7" />}
        />
      ) : (
        <ul className="space-y-3">
          {intents.map((i) => (
            <li key={i.id}>
              <Link href={`/dashboard/intents/${i.id}`}>
                <Card className="transition-transform hover:-translate-y-0.5">
                  <CardBody className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <Badge tone={i.status === "executed" ? "active" : "pending"}>{i.status}</Badge>
                      <p className="mt-2 font-mono text-xs text-slate-500">{i.id.slice(0, 12)}…</p>
                    </div>
                    <span className="text-sm font-medium text-brand-300">View →</span>
                  </CardBody>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

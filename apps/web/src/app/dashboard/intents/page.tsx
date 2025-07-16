"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listOrgs } from "@/lib/api/orgs";
import { listIntents, type IntentRecord } from "@/lib/api/intents";
import { EmptyState } from "@/components/ui/empty-state";
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-white">Transfer intents</h1>
        <Link href="/dashboard/intents/new" className="text-sm text-accent">
          New transfer
        </Link>
      </div>
      {!intents.length ? (
        <EmptyState
          title="No transfer intents yet"
          description="Create a USDC payout intent to start the approval workflow."
          actionLabel="Create intent"
          actionHref="/dashboard/intents/new"
        />
      ) : (
        <ul className="space-y-2">
          {intents.map((i) => (
            <li key={i.id}>
              <Link
                href={`/dashboard/intents/${i.id}`}
                className="block rounded-lg border border-surface-border px-4 py-3 hover:bg-surface"
              >
                <span className="text-sm text-white capitalize">{i.status}</span>
                <span className="text-xs text-slate-500 ml-2 font-mono">
                  {i.id.slice(0, 8)}…
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

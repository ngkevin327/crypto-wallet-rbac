"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { apiRequest } from "@/lib/api-client";
import { listRoles } from "@/lib/api/policies";
import { createApiKey, listApiKeys, revokeApiKey, type ApiKeyRecord } from "@/lib/api/api-keys";
import { CreateApiKeyModal } from "@/components/settings/create-api-key-modal";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";

export default function ApiKeysSettingsPage() {
  const { token } = useAuth();
  const [orgId, setOrgId] = useState("");
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  async function refresh() {
    if (!token || !orgId) return;
    setKeys(await listApiKeys(token, orgId));
  }

  useEffect(() => {
    if (!token) return;
    void (async () => {
      const orgs = await apiRequest<{ id: string }[]>("/orgs", { token });
      const id = orgs[0]?.id ?? "";
      setOrgId(id);
      if (id) {
        setRoles(await listRoles(token, id));
        await refresh();
      }
    })();
  }, [token]);

  if (!orgId) return <LoadingState />;

  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader
        title="API keys"
        description="Machine access scoped to a role policy for bots and integrations."
        actions={[{ label: "Create key", onClick: () => setModalOpen(true) }]}
      />

      <ul className="space-y-3">
        {keys.map((k) => (
          <Card key={k.id}>
            <CardBody className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="font-medium text-white">{k.name}</p>
                <p className="mt-1 font-mono text-xs text-slate-500">{k.keyPrefix}…</p>
                {k.lastUsedAt && (
                  <p className="mt-1 text-xs text-slate-500">
                    Last used {new Date(k.lastUsedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {k.revokedAt ? (
                  <Badge tone="deactivated">Revoked</Badge>
                ) : (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={async () => {
                      if (!token) return;
                      await revokeApiKey(token, orgId, k.id);
                      await refresh();
                    }}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </ul>

      <CreateApiKeyModal
        open={modalOpen}
        roles={roles}
        onClose={() => {
          setModalOpen(false);
          void refresh();
        }}
        onCreate={async (name, roleId) => {
          if (!token) return null;
          const created = await createApiKey(token, orgId, { name, roleId });
          await refresh();
          return created.secret;
        }}
      />
    </div>
  );
}

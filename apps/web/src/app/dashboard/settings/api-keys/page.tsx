"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { apiRequest } from "@/lib/api-client";
import { listRoles } from "@/lib/api/policies";
import { createApiKey, listApiKeys, revokeApiKey, type ApiKeyRecord } from "@/lib/api/api-keys";
import { CreateApiKeyModal } from "@/components/settings/create-api-key-modal";

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

  if (!orgId) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-white">API keys</h1>
        <button
          type="button"
          className="rounded-md bg-accent px-4 py-2 text-sm text-white"
          onClick={() => setModalOpen(true)}
        >
          Create key
        </button>
      </div>
      <ul className="space-y-2">
        {keys.map((k) => (
          <li
            key={k.id}
            className="flex justify-between items-center rounded-lg border border-surface-border px-4 py-3"
          >
            <div>
              <p className="text-sm text-white">{k.name}</p>
              <p className="text-xs font-mono text-slate-500">{k.keyPrefix}…</p>
              {k.lastUsedAt && (
                <p className="text-xs text-slate-600">
                  Last used {new Date(k.lastUsedAt).toLocaleString()}
                </p>
              )}
            </div>
            {!k.revokedAt && (
              <button
                type="button"
                className="text-xs text-red-400"
                onClick={async () => {
                  if (!token) return;
                  await revokeApiKey(token, orgId, k.id);
                  await refresh();
                }}
              >
                Revoke
              </button>
            )}
          </li>
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

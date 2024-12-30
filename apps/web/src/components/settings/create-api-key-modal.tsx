"use client";

import { useState } from "react";

export function CreateApiKeyModal({
  open,
  roles,
  onCreate,
  onClose,
}: {
  open: boolean;
  roles: { id: string; name: string }[];
  onCreate: (name: string, roleId: string) => Promise<string | null>;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [roleId, setRoleId] = useState("");
  const [secret, setSecret] = useState<string | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-lg border border-surface-border bg-surface-raised p-6 space-y-4">
        {secret ? (
          <>
            <h2 className="text-lg text-white">API key created</h2>
            <p className="text-xs text-slate-400">Copy now — it will not be shown again.</p>
            <code className="block break-all text-sm text-emerald-300">{secret}</code>
            <button type="button" className="text-sm text-accent" onClick={onClose}>
              Done
            </button>
          </>
        ) : (
          <>
            <h2 className="text-lg text-white">Create API key</h2>
            <input
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm"
              placeholder="Key name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <select
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
            >
              <option value="">Select bot role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button type="button" className="text-sm text-slate-400" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md bg-accent px-4 py-2 text-sm text-white"
                onClick={async () => {
                  const s = await onCreate(name, roleId);
                  if (s) setSecret(s);
                }}
              >
                Create
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

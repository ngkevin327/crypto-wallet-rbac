"use client";

import { useState } from "react";
import { inviteMember } from "@/lib/api/orgs";
import { ApiClientError } from "@/lib/api-client";

interface Props {
  orgId: string;
  token: string;
  onClose: () => void;
  onInvited: () => void;
}

export function InviteMemberModal({ orgId, token, onClose, onInvited }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("org_member");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await inviteMember(token, orgId, email, role);
      onInvited();
      onClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Invite failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg border border-surface-border bg-surface-raised p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Invite team member</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Platform role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm"
            >
              <option value="org_admin">Admin</option>
              <option value="org_member">Member</option>
              <option value="org_viewer">Viewer</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Send invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

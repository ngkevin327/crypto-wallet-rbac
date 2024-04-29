"use client";

import { useCallback, useEffect, useState } from "react";
import { createOrg, deactivateMember, listMembers, listOrgs } from "@/lib/api/orgs";
import { InviteMemberModal } from "@/components/team/invite-member-modal";
import { MemberTable } from "@/components/team/member-table";
import { useAuth } from "@/providers/auth-provider";

export default function TeamPage() {
  const { token } = useAuth();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [members, setMembers] = useState<Awaited<ReturnType<typeof listMembers>>>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      let orgs = await listOrgs(token);
      if (orgs.length === 0) {
        orgs = [await createOrg(token, "My Organization")];
      }
      const id = orgs[0].id;
      setOrgId(id);
      setMembers(await listMembers(token, id));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDeactivate(memberId: string) {
    if (!token || !orgId) return;
    await deactivateMember(token, orgId, memberId);
    await load();
  }

  if (loading) {
    return <p className="text-slate-400">Loading team…</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Team</h1>
          <p className="text-slate-400 text-sm mt-1">Manage members and platform roles</p>
        </div>
        <button
          type="button"
          onClick={() => setShowInvite(true)}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Invite member
        </button>
      </div>

      <MemberTable members={members} onDeactivate={handleDeactivate} />

      {showInvite && token && orgId && (
        <InviteMemberModal
          orgId={orgId}
          token={token}
          onClose={() => setShowInvite(false)}
          onInvited={load}
        />
      )}
    </div>
  );
}

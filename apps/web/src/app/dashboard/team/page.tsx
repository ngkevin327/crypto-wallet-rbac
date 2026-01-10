"use client";

import { useCallback, useEffect, useState } from "react";
import { createOrg, deactivateMember, listMembers, listOrgs } from "@/lib/api/orgs";
import { InviteMemberModal } from "@/components/team/invite-member-modal";
import { MemberDrawer } from "@/components/team/member-drawer";
import { MemberTable } from "@/components/team/member-table";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState } from "@/components/ui/loading";
import { useAuth } from "@/providers/auth-provider";

export default function TeamPage() {
  const { token } = useAuth();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [members, setMembers] = useState<Awaited<ReturnType<typeof listMembers>>>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [selectedMember, setSelectedMember] = useState<(typeof members)[0] | null>(null);
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
    return <LoadingState message="Loading team…" />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Team"
        description="Invite colleagues, assign treasury roles, and manage platform access."
        actions={[{ label: "Invite member", onClick: () => setShowInvite(true) }]}
      />

      <MemberTable
        members={members}
        onDeactivate={handleDeactivate}
        onSelect={setSelectedMember}
      />

      {selectedMember && token && orgId && (
        <MemberDrawer
          member={selectedMember}
          orgId={orgId}
          token={token}
          onClose={() => setSelectedMember(null)}
        />
      )}

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

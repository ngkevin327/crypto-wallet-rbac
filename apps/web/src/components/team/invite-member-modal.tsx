"use client";

import { useState } from "react";
import { inviteMember } from "@/lib/api/orgs";
import { ApiClientError } from "@/lib/api-client";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

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
    <Modal
      open
      title="Invite team member"
      description="They will receive an email invitation to join your organization."
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="invite-member-form" disabled={loading}>
            {loading ? "Sending…" : "Send invite"}
          </Button>
        </>
      }
    >
      <form id="invite-member-form" onSubmit={submit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Select label="Platform role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="org_admin">Admin</option>
          <option value="org_member">Member</option>
          <option value="org_viewer">Viewer</option>
        </Select>
        {error && <Alert variant="error">{error}</Alert>}
      </form>
    </Modal>
  );
}

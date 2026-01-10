"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

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

  if (secret) {
    return (
      <Modal
        open
        title="API key created"
        description="Copy now — it will not be shown again."
        onClose={onClose}
        footer={
          <Button type="button" onClick={onClose}>
            Done
          </Button>
        }
      >
        <Alert variant="success">
          <code className="block break-all font-mono text-sm">{secret}</code>
        </Alert>
      </Modal>
    );
  }

  return (
    <Modal
      open
      title="Create API key"
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={async () => {
              const s = await onCreate(name, roleId);
              if (s) setSecret(s);
            }}
          >
            Create
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input placeholder="Key name" value={name} onChange={(e) => setName(e.target.value)} label="Name" />
        <Select label="Bot role" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
          <option value="">Select bot role</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      </div>
    </Modal>
  );
}

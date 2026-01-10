"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function ConfirmApprovalModal({
  open,
  decision,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  decision: "approved" | "rejected";
  onConfirm: (note?: string) => void;
  onCancel: () => void;
}) {
  const [note, setNote] = useState("");

  return (
    <Modal
      open={open}
      title={`Confirm ${decision}`}
      description="This action cannot be undone. Add an optional note for the audit log."
      onClose={onCancel}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={decision === "approved" ? "primary" : "danger"}
            className={decision === "approved" ? "bg-emerald-600 hover:bg-emerald-500" : undefined}
            onClick={() => onConfirm(note || undefined)}
          >
            Confirm
          </Button>
        </>
      }
    >
      <Textarea
        id="approval-note"
        placeholder="Optional note"
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
    </Modal>
  );
}

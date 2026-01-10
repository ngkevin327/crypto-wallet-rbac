"use client";

import { useState } from "react";
import { decideApproval } from "@/lib/api/approvals";
import { ConfirmApprovalModal } from "./confirm-approval-modal";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function ApprovalActions({
  token,
  requestId,
  onDone,
  disabled,
}: {
  token: string;
  requestId: string;
  onDone: () => void;
  disabled?: boolean;
}) {
  const [modal, setModal] = useState<"approved" | "rejected" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(decision: "approved" | "rejected", note?: string) {
    setError(null);
    try {
      await decideApproval(token, requestId, { decision, note });
      setModal(null);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Decision failed");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        disabled={disabled}
        aria-label="Approve transfer intent"
        className="bg-emerald-600 hover:bg-emerald-500"
        onClick={() => setModal("approved")}
      >
        Approve
      </Button>
      <Button
        type="button"
        variant="danger"
        disabled={disabled}
        aria-label="Reject transfer intent"
        onClick={() => setModal("rejected")}
      >
        Reject
      </Button>
      {error && <Alert variant="error" className="w-full">{error}</Alert>}
      <ConfirmApprovalModal
        open={modal !== null}
        decision={modal ?? "approved"}
        onConfirm={(note) => void submit(modal!, note)}
        onCancel={() => setModal(null)}
      />
    </div>
  );
}

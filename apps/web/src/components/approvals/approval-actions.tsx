"use client";

import { useState } from "react";
import { decideApproval } from "@/lib/api/approvals";
import { ConfirmApprovalModal } from "./confirm-approval-modal";

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
    <div className="flex gap-2">
      <button
        type="button"
        disabled={disabled}
        className="rounded-md bg-emerald-700 px-3 py-2 text-sm text-white disabled:opacity-40"
        onClick={() => setModal("approved")}
      >
        Approve
      </button>
      <button
        type="button"
        disabled={disabled}
        className="rounded-md bg-red-800 px-3 py-2 text-sm text-white disabled:opacity-40"
        onClick={() => setModal("rejected")}
      >
        Reject
      </button>
      {error && <p className="text-xs text-red-400 w-full">{error}</p>}
      <ConfirmApprovalModal
        open={modal !== null}
        decision={modal ?? "approved"}
        onConfirm={(note) => void submit(modal!, note)}
        onCancel={() => setModal(null)}
      />
    </div>
  );
}

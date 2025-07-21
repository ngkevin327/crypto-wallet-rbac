"use client";

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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-lg border border-surface-border bg-surface-raised p-6 space-y-4">
        <h2 className="text-lg text-white capitalize">Confirm {decision}</h2>
        <p className="text-sm text-slate-400">
          This action cannot be undone. Add an optional note for the audit log.
        </p>
        <textarea
          id="approval-note"
          className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm"
          placeholder="Optional note"
          rows={2}
        />
        <div className="flex justify-end gap-2">
          <button type="button" className="text-sm text-slate-400" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={`rounded-md px-4 py-2 text-sm text-white ${
              decision === "approved" ? "bg-emerald-600" : "bg-red-600"
            }`}
            onClick={() => {
              const note = (
                document.getElementById("approval-note") as HTMLTextAreaElement | null
              )?.value;
              onConfirm(note || undefined);
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

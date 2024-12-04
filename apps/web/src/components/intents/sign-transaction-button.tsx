"use client";

import { useState } from "react";
import { proposeIntent } from "@/lib/api/intents";

export function SignTransactionButton({
  token,
  intentId,
  senderAddress,
  onProposed,
}: {
  token: string;
  intentId: string;
  senderAddress: string;
  onProposed?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSign() {
    setLoading(true);
    setError(null);
    try {
      await proposeIntent(token, intentId, { senderAddress, signature: "0x" });
      onProposed?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Propose failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void handleSign()}
        disabled={loading}
        className="rounded-md bg-accent px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Proposing…" : "Sign with wallet"}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}

"use client";

import { useState } from "react";
import { proposeIntent } from "@/lib/api/intents";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

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
      <Button type="button" onClick={() => void handleSign()} disabled={loading} size="md">
        {loading ? "Proposing…" : "Sign with wallet"}
      </Button>
      {error && <Alert variant="error" className="mt-2">{error}</Alert>}
    </div>
  );
}

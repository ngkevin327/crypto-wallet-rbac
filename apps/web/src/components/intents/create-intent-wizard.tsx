"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { evaluatePolicy } from "@/lib/api/policies";
import { createIntent } from "@/lib/api/intents";
import { useAuth } from "@/providers/auth-provider";
import { PolicyPreviewBadge } from "./policy-preview-badge";
import { WizardSteps } from "@/components/ui/wizard-steps";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody } from "@/components/ui/card";

const STEPS = ["Wallet", "Recipient", "Amount", "Review"] as const;

export function CreateIntentWizard({
  orgId,
  memberId,
  wallets,
}: {
  orgId: string;
  memberId: string;
  wallets: { id: string; nickname?: string | null; address: string }[];
}) {
  const { token } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [walletId, setWalletId] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [amountUsd, setAmountUsd] = useState("");
  const [preview, setPreview] = useState<{ decision: string; reasons: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const chainId = 11155111;
  const tokenAddress = "0x1c7d4b196cb0c7b4b7ba5bbd7412162b4c447b4";
  const amountNative = String(Math.round(Number(amountUsd || "0") * 1_000_000));

  async function runPreview() {
    if (!token || !walletId) return;
    const res = await evaluatePolicy(token, {
      orgId,
      memberId,
      walletId,
      tokenAddress,
      chainId,
      amountNative,
    });
    setPreview(res);
  }

  async function submit() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const intent = await createIntent(token, orgId, {
        walletId,
        tokenAddress,
        chainId,
        amountNative,
        toAddress,
      });
      router.push(`/dashboard/intents/${intent.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create intent");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <WizardSteps steps={STEPS} current={step} />

      {step === 0 && (
        <Select label="Treasury wallet" value={walletId} onChange={(e) => setWalletId(e.target.value)}>
          <option value="">Select wallet</option>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.nickname ?? w.address.slice(0, 10)}
            </option>
          ))}
        </Select>
      )}

      {step === 1 && (
        <Input
          label="Recipient address"
          className="font-mono"
          placeholder="0x…"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
        />
      )}

      {step === 2 && (
        <Input
          label="Amount (USDC)"
          type="number"
          value={amountUsd}
          onChange={(e) => setAmountUsd(e.target.value)}
        />
      )}

      {step === 3 && (
        <Card>
          <CardBody className="space-y-3">
            <p className="text-sm font-medium text-slate-300">Review transfer</p>
            <p className="font-mono text-xs text-slate-500">{toAddress}</p>
            <p className="font-display text-2xl font-semibold text-white">${amountUsd} USDC</p>
            <PolicyPreviewBadge decision={preview?.decision} reasons={preview?.reasons} />
          </CardBody>
        </Card>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      <div className="flex flex-wrap gap-2">
        {step > 0 && (
          <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        )}
        {step < 3 && (
          <Button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 0 && !walletId}
          >
            Next
          </Button>
        )}
        {step === 3 && (
          <>
            <Button type="button" variant="secondary" onClick={() => void runPreview()}>
              Preview policy
            </Button>
            <Button
              type="button"
              disabled={loading || preview?.decision === "DENY"}
              onClick={() => void submit()}
            >
              {loading ? "Creating…" : "Create intent"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { evaluatePolicy } from "@/lib/api/policies";
import { createIntent } from "@/lib/api/intents";
import { useAuth } from "@/providers/auth-provider";
import { PolicyPreviewBadge } from "./policy-preview-badge";

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
    <div className="max-w-lg space-y-6">
      <div className="flex gap-2 text-xs text-slate-500">
        {STEPS.map((label, i) => (
          <span key={label} className={i === step ? "text-accent" : ""}>
            {i + 1}. {label}
          </span>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-2">
          <label className="text-sm text-slate-400">Treasury wallet</label>
          <select
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm"
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
          >
            <option value="">Select wallet</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.nickname ?? w.address.slice(0, 10)}
              </option>
            ))}
          </select>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-2">
          <label className="text-sm text-slate-400">Recipient address</label>
          <input
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm font-mono"
            placeholder="0x…"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2">
          <label className="text-sm text-slate-400">Amount (USDC)</label>
          <input
            type="number"
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm"
            value={amountUsd}
            onChange={(e) => setAmountUsd(e.target.value)}
          />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 rounded-lg border border-surface-border p-4">
          <p className="text-sm text-slate-300">Review transfer</p>
          <p className="text-xs text-slate-500 font-mono">{toAddress}</p>
          <p className="text-lg text-white">${amountUsd} USDC</p>
          <PolicyPreviewBadge decision={preview?.decision} reasons={preview?.reasons} />
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-2">
        {step > 0 && (
          <button
            type="button"
            className="rounded-md px-4 py-2 text-sm text-slate-400 hover:text-white"
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </button>
        )}
        {step < 3 && (
          <button
            type="button"
            className="rounded-md bg-accent px-4 py-2 text-sm text-white"
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 0 && !walletId}
          >
            Next
          </button>
        )}
        {step === 3 && (
          <>
            <button
              type="button"
              className="rounded-md border border-surface-border px-4 py-2 text-sm"
              onClick={() => void runPreview()}
            >
              Preview policy
            </button>
            <button
              type="button"
              className="rounded-md bg-accent px-4 py-2 text-sm text-white disabled:opacity-50"
              disabled={loading || preview?.decision === "DENY"}
              onClick={() => void submit()}
            >
              {loading ? "Creating…" : "Create intent"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

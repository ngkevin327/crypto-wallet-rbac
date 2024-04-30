"use client";

import { useState } from "react";
import { listOrgs } from "@/lib/api/orgs";
import { startWalletConnect, verifyWalletConnect } from "@/lib/api/wallets";
import { ApiClientError } from "@/lib/api-client";

interface Props {
  token: string;
  onConnected: () => void;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<string>;
    };
  }
}

export function ConnectSafeForm({ token, onConnected }: Props) {
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState("11155111");
  const [nickname, setNickname] = useState("");
  const [step, setStep] = useState<"form" | "sign">("form");
  const [challenge, setChallenge] = useState<{
    challengeId: string;
    message: string;
    orgId: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const orgs = await listOrgs(token);
      if (!orgs.length) {
        setError("Create an organization first from the Team page.");
        return;
      }
      const orgId = orgs[0].id;
      const res = await startWalletConnect(
        token,
        orgId,
        address,
        Number(chainId),
        nickname || undefined
      );
      setChallenge({ challengeId: res.challengeId, message: res.message, orgId });
      setStep("sign");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Connect failed");
    } finally {
      setLoading(false);
    }
  }

  async function signWithWallet() {
    if (!challenge || !window.ethereum) {
      setError("No wallet extension detected");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [challenge.message, address],
      });
      await verifyWalletConnect(token, challenge.orgId, {
        address,
        chainId: Number(chainId),
        challengeId: challenge.challengeId,
        signature,
      });
      onConnected();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  if (step === "sign" && challenge) {
    return (
      <div className="rounded-lg border border-surface-border bg-surface-raised p-6 max-w-lg">
        <h2 className="text-lg font-semibold text-white mb-2">Sign verification message</h2>
        <p className="text-sm text-slate-400 mb-4">
          Use your browser wallet to prove you own this Safe.
        </p>
        <pre className="text-xs bg-surface p-3 rounded mb-4 overflow-auto max-h-32 text-slate-300">
          {challenge.message}
        </pre>
        {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
        <button
          type="button"
          onClick={signWithWallet}
          disabled={loading}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Signing…" : "Sign with wallet"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised p-6 max-w-lg">
      <h2 className="text-lg font-semibold text-white mb-4">Connect Gnosis Safe</h2>
      <form onSubmit={handleConnect} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Safe address</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x…"
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm font-mono"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Network</label>
          <select
            value={chainId}
            onChange={(e) => setChainId(e.target.value)}
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm"
          >
            <option value="11155111">Sepolia</option>
            <option value="1">Ethereum Mainnet</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Nickname (optional)</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Treasury Safe"
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Validating…" : "Continue"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { listOrgs } from "@/lib/api/orgs";
import { startWalletConnect, verifyWalletConnect } from "@/lib/api/wallets";
import { ApiClientError } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

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
      const res = await startWalletConnect(token, orgId, address, Number(chainId), nickname || undefined);
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
      <div className="max-w-lg space-y-4">
        <p className="text-sm text-slate-400">Use your browser wallet to prove you own this Safe.</p>
        <pre className="max-h-32 overflow-auto rounded-xl border border-surface-border bg-surface p-4 text-xs text-slate-300">
          {challenge.message}
        </pre>
        {error && <Alert variant="error">{error}</Alert>}
        <Button type="button" onClick={signWithWallet} disabled={loading}>
          {loading ? "Signing…" : "Sign with wallet"}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleConnect} className="max-w-lg space-y-5">
      <Input
        label="Safe address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="0x…"
        className="font-mono"
        required
      />
      <Select label="Network" value={chainId} onChange={(e) => setChainId(e.target.value)}>
        <option value="11155111">Sepolia (testnet)</option>
        <option value="1">Ethereum Mainnet</option>
      </Select>
      <Input
        label="Nickname (optional)"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="Treasury Safe"
      />
      {error && <Alert variant="error">{error}</Alert>}
      <Button type="submit" disabled={loading}>
        {loading ? "Validating…" : "Continue to signature"}
      </Button>
    </form>
  );
}

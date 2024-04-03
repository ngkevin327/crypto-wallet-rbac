"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { register } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api-client";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await register(email, password);
      localStorage.setItem("wtp_access_token", result.accessToken);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised p-8 shadow-xl">
      <h1 className="text-xl font-semibold text-white mb-1">Create account</h1>
      <p className="text-sm text-slate-400 mb-6">Start governing wallet access for your team</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Password (min 12 chars)</label>
          <input
            type="password"
            minLength={12}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm"
            required
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-accent py-2 text-sm font-medium text-white hover:bg-accent-muted disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

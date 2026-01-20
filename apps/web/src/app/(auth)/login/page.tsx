"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { login } from "@/lib/api/auth";
import { setAccessToken } from "@/lib/auth-token";
import { ApiClientError } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
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
      const result = await login(email, password);
      if (result.requiresMfa) {
        setError("MFA is required. Complete verification in a follow-up step.");
        return;
      }
      setAccessToken(result.accessToken);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormCard
      title="Welcome back"
      description="Sign in to manage treasury permissions"
      footer={
        <p className="text-center text-sm text-slate-400">
          New to WTP?{" "}
          <Link href="/register" className="font-medium text-brand-300 hover:text-brand-200">
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Work email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <Button type="submit" disabled={loading} className="w-full" size="md">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthFormCard>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { register } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api-client";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <Card glow className="overflow-hidden">
      <CardBody className="p-8">
        <h1 className="font-display text-2xl font-semibold text-white">Create your workspace</h1>
        <p className="mt-2 text-sm text-slate-400">Set up governed wallet access in minutes</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Input
            label="Work email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="founder@startup.io"
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint="At least 12 characters"
            required
          />
          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Creating workspace…" : "Get started"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-300 hover:text-brand-200">
            Sign in
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}

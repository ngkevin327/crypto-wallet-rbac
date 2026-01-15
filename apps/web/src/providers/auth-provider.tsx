"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchMe, logout as apiLogout } from "@/lib/api/auth";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/auth-token";
import type { MeResponse } from "@/lib/api/types";

interface AuthContextValue {
  user: MeResponse | null;
  token: string | null;
  loading: boolean;
  setToken: (token: string | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const setToken = useCallback((value: string | null) => {
    if (value) {
      setAccessToken(value);
    } else {
      clearAccessToken();
    }
    setTokenState(value);
  }, []);

  const refreshUser = useCallback(async () => {
    const stored = getAccessToken();
    if (!stored) {
      setUser(null);
      setTokenState(null);
      return;
    }
    try {
      const me = await fetchMe(stored);
      setUser(me);
      setTokenState(stored);
    } catch {
      clearAccessToken();
      setUser(null);
      setTokenState(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Still clear local session if API logout fails (e.g. expired refresh cookie).
    } finally {
      setToken(null);
      setUser(null);
      window.location.assign("/login");
    }
  }, [setToken]);

  return (
    <AuthContext.Provider value={{ user, token, loading, setToken, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { registerApiErrorHandler } from "@/lib/api-client";
import { cn } from "@/lib/cn";

type Toast = { id: number; message: string; variant: "success" | "error" };

const ToastContext = createContext<{
  toast: (message: string, variant?: "success" | "error") => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const toast = useCallback((message: string, variant: "success" | "error" = "success") => {
    const id = Date.now();
    setItems((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  useEffect(() => {
    registerApiErrorHandler((message) => toast(message, "error"));
    return () => registerApiErrorHandler(null);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "animate-slide-up rounded-xl border px-4 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-md",
              t.variant === "error"
                ? "border-red-500/40 bg-red-950/90"
                : "border-emerald-500/40 bg-emerald-950/90"
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

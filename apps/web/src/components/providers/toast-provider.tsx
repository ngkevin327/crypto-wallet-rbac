"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { registerApiErrorHandler } from "@/lib/api-client";

type Toast = { id: number; message: string; variant: "success" | "error" };

const ToastContext = createContext<{
  toast: (message: string, variant?: "success" | "error") => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const toast = useCallback((message: string, variant: "success" | "error" = "success") => {
    const id = Date.now();
    setItems((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  useEffect(() => {
    registerApiErrorHandler((message) => toast(message, "error"));
    return () => registerApiErrorHandler(null);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={`rounded-md px-4 py-2 text-sm text-white shadow-lg ${
              t.variant === "error" ? "bg-red-800" : "bg-emerald-800"
            }`}
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

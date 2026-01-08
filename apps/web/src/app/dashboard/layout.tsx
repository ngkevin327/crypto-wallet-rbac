"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { HelpLink } from "@/components/layout/help-link";
import { ErrorBoundary } from "@/components/error-boundary";
import { ToastProvider } from "@/components/providers/toast-provider";
import { AuthProvider } from "@/providers/auth-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <ErrorBoundary>
          <div className="flex min-h-screen bg-surface">
            <div className="pointer-events-none fixed inset-0 bg-mesh-app" aria-hidden />
            <Sidebar />
            <main className="relative flex-1 overflow-x-hidden">
              <div className="sticky top-0 z-10 flex justify-end border-b border-surface-border/60 bg-surface/80 px-8 py-4 backdrop-blur-md">
                <HelpLink />
              </div>
              <div className="animate-fade-in px-8 py-8">{children}</div>
            </main>
          </div>
        </ErrorBoundary>
      </ToastProvider>
    </AuthProvider>
  );
}

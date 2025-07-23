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
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8">
              <div className="flex justify-end mb-4">
                <HelpLink />
              </div>
              {children}
            </main>
          </div>
        </ErrorBoundary>
      </ToastProvider>
    </AuthProvider>
  );
}

"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { AuthProvider } from "@/providers/auth-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </AuthProvider>
  );
}

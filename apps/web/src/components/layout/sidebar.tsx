"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/wallets", label: "Wallets" },
  { href: "/dashboard/team", label: "Team" },
  { href: "/dashboard/policies", label: "Policies" },
  { href: "/dashboard/intents/new", label: "New transfer" },
  { href: "/dashboard/approvals", label: "Approvals" },
  { href: "/dashboard/audit", label: "Audit" },
  { href: "/dashboard/settings/api-keys", label: "API keys" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-56 border-r border-surface-border bg-surface-raised flex flex-col min-h-screen">
      <div className="p-4 border-b border-surface-border">
        <span className="font-semibold text-white text-sm">WTP</span>
        <p className="text-xs text-slate-500 truncate mt-1">{user?.email}</p>
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm ${
                active
                  ? "bg-accent/20 text-accent"
                  : "text-slate-400 hover:bg-surface hover:text-slate-200"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={() => logout()}
        className="m-2 rounded-md px-3 py-2 text-sm text-slate-400 hover:text-white text-left"
      >
        Sign out
      </button>
    </aside>
  );
}

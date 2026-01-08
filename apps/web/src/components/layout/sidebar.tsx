"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/cn";
import {
  IconLogo,
  IconDashboard,
  IconWallet,
  IconUsers,
  IconShield,
  IconSend,
  IconCheckCircle,
  IconList,
  IconKey,
  IconLogOut,
} from "@/components/icons";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { href: "/dashboard/wallets", label: "Wallets", icon: IconWallet },
  { href: "/dashboard/team", label: "Team", icon: IconUsers },
  { href: "/dashboard/policies", label: "Policies", icon: IconShield },
  { href: "/dashboard/intents", label: "Intents", icon: IconList },
  { href: "/dashboard/intents/new", label: "New transfer", icon: IconSend, highlight: true },
  { href: "/dashboard/approvals", label: "Approvals", icon: IconCheckCircle },
  { href: "/dashboard/audit", label: "Audit log", icon: IconList },
  { href: "/dashboard/settings/api-keys", label: "API keys", icon: IconKey },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-surface-border bg-surface-raised/80 backdrop-blur-xl">
      <div className="border-b border-surface-border px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <IconLogo className="h-9 w-9" />
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold text-white leading-tight">WTP</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Treasury control</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-brand-500/15 text-brand-200 shadow-sm ring-1 ring-brand-500/25"
                  : "text-slate-400 hover:bg-surface-overlay hover:text-slate-200",
                item.highlight &&
                  !active &&
                  "border border-dashed border-brand-500/30 text-brand-300 hover:border-brand-500/50"
              )}
            >
              <Icon className={cn(active ? "text-brand-300" : "text-slate-500")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-surface-border p-3">
        <div className="mb-2 rounded-xl bg-surface-overlay/80 px-3 py-2.5">
          <p className="truncate text-xs font-medium text-slate-300">{user?.email ?? "Signed in"}</p>
          <p className="text-[10px] text-slate-500">Organization admin</p>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-surface-overlay hover:text-white"
        >
          <IconLogOut />
          Sign out
        </button>
      </div>
    </aside>
  );
}

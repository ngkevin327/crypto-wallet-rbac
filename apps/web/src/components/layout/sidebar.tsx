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

  const navLinkClass =
    "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium leading-snug transition-colors duration-150";

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-surface-border bg-surface-raised/80 backdrop-blur-xl">
      <div className="border-b border-surface-border px-4 py-3.5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <IconLogo className="h-7 w-7" />
          <div className="min-w-0">
            <p className="font-display text-xs font-semibold text-white leading-tight">WTP</p>
            <p className="text-[9px] uppercase tracking-wider text-slate-500">Treasury control</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
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
                navLinkClass,
                active
                  ? "bg-brand-500/15 text-brand-200 ring-1 ring-brand-500/25"
                  : "text-slate-400 hover:bg-surface-overlay hover:text-slate-200",
                item.highlight &&
                  !active &&
                  "border border-dashed border-brand-500/30 text-brand-300 hover:border-brand-500/50"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-brand-300" : "text-slate-500")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-surface-border p-2">
        {user?.email && (
          <div className="mb-1.5 rounded-lg bg-surface-overlay/80 px-2.5 py-1.5">
            <p className="truncate text-[11px] font-medium text-slate-300">{user.email}</p>
            <p className="text-[9px] text-slate-500">Organization admin</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => void logout()}
          className={cn(navLinkClass, "w-full text-slate-400 hover:bg-surface-overlay hover:text-white")}
        >
          <IconLogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

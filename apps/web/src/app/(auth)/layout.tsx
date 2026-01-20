import Link from "next/link";
import type { ComponentType } from "react";
import { AuthBackground } from "@/components/auth/auth-background";
import { BrandLogo } from "@/components/brand/brand-logo";
import {
  IconCheckCircle,
  IconList,
  IconSparkles,
  IconUsers,
  type IconProps,
} from "@/components/icons";

const highlights: {
  title: string;
  text: string;
  icon: ComponentType<IconProps>;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    title: "Role-based limits",
    text: "Scoped spend rules per team role.",
    icon: IconUsers,
    iconBg: "bg-brand-500/25 ring-brand-500/35",
    iconColor: "text-brand-200",
  },
  {
    title: "Approval workflows",
    text: "Multi-signer review for high-value transfers.",
    icon: IconCheckCircle,
    iconBg: "bg-emerald-500/20 ring-emerald-500/30",
    iconColor: "text-emerald-300",
  },
  {
    title: "Audit-ready",
    text: "Policy and approval events logged automatically.",
    icon: IconList,
    iconBg: "bg-sky-500/20 ring-sky-500/30",
    iconColor: "text-sky-300",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-surface">
      <AuthBackground />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-10 px-5 py-10 sm:px-8 lg:flex-row lg:items-center lg:gap-16 lg:py-12">
        <section className="w-full shrink-0 lg:order-2 lg:max-w-[380px]">{children}</section>

        <section className="w-full lg:order-1 lg:flex-1 lg:max-w-lg">
          <Link href="/login" className="group flex items-start gap-5">
            <div
              className="relative flex h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center rounded-[1.35rem] bg-brand-500/20 shadow-[0_0_40px_-8px_rgba(99,102,241,0.55)] ring-2 ring-brand-400/50 transition-transform duration-200 group-hover:scale-[1.02] sm:h-24 sm:w-24"
              aria-hidden
            >
              <BrandLogo className="h-[4.25rem] w-[4.25rem] sm:h-[4.75rem] sm:w-[4.75rem]" />
            </div>
            <div className="min-w-0 pt-1">
              <p className="font-display text-2xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-[1.75rem] lg:text-3xl">
                Wallet Team Permissions
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-brand-300 sm:text-[11px]">
                Treasury governance
              </p>
            </div>
          </Link>

          <div className="mt-10 space-y-7">
            <div>
              <h2 className="font-display text-3xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-[2.5rem]">
                Govern your Safe like{" "}
                <span className="text-gradient">enterprise access control</span>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
                Connect Gnosis Safe, set spend policies, and route approvals—without sharing keys in chat.
              </p>
            </div>

            <ul className="space-y-3">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.title}
                    className="flex gap-3.5 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-3 backdrop-blur-[2px]"
                  >
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ${item.iconBg}`}
                    >
                      <Icon className={`h-5 w-5 ${item.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="mt-8 hidden items-center gap-2 text-xs text-slate-500 lg:flex">
            <IconSparkles className="h-3.5 w-3.5 text-brand-400" />
            Built for crypto startups and DAO ops teams
          </p>
        </section>
      </div>
    </div>
  );
}

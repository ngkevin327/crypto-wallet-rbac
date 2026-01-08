"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

const styles = [
  { ring: "ring-amber-500/20", accent: "text-amber-300", bg: "from-amber-500/10" },
  { ring: "ring-brand-500/20", accent: "text-brand-300", bg: "from-brand-500/10" },
  { ring: "ring-red-500/20", accent: "text-red-300", bg: "from-red-500/10" },
];

export function StatsCards({
  pendingApprovals,
  intentsLast24h,
  policyDenials24h,
}: {
  pendingApprovals: number;
  intentsLast24h: number;
  policyDenials24h: number;
}) {
  const cards = [
    { label: "Pending approvals", value: pendingApprovals, href: "/dashboard/approvals" },
    { label: "Intents (24h)", value: intentsLast24h, href: "/dashboard/intents" },
    { label: "Policy denials (24h)", value: policyDenials24h },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card, i) => {
        const style = styles[i] ?? styles[1];
        const inner = (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className={cn("mt-2 font-display text-3xl font-semibold tabular-nums", style.accent)}>
              {card.value}
            </p>
          </>
        );
        const className = cn(
          "group rounded-2xl border border-surface-border bg-gradient-to-br to-surface-raised p-5",
          "shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5",
          style.bg,
          style.ring,
          "ring-1"
        );
        return card.href ? (
          <Link key={card.label} href={card.href} className={className}>
            {inner}
          </Link>
        ) : (
          <div key={card.label} className={className}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}

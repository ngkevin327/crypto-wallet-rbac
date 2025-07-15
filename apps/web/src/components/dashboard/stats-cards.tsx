"use client";

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
      {cards.map((card) => (
        <a
          key={card.label}
          href={card.href ?? "#"}
          className="rounded-lg border border-surface-border bg-surface-raised p-4 hover:border-accent/40"
        >
          <p className="text-xs text-slate-500">{card.label}</p>
          <p className="text-2xl font-semibold text-white mt-1">{card.value}</p>
        </a>
      ))}
    </div>
  );
}

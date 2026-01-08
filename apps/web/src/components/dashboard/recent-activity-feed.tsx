"use client";

export function RecentActivityFeed({
  events,
}: {
  events: {
    id: string;
    eventType: string;
    createdAt: string;
  }[];
}) {
  if (!events.length) {
    return <p className="py-4 text-sm text-slate-500">No recent activity yet.</p>;
  }

  return (
    <ul className="divide-y divide-surface-border/60">
      {events.map((e) => (
        <li key={e.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
          <span className="rounded-lg bg-surface-overlay px-2.5 py-1 font-mono text-xs text-brand-200">
            {e.eventType}
          </span>
          <time className="shrink-0 text-xs text-slate-500">{new Date(e.createdAt).toLocaleString()}</time>
        </li>
      ))}
    </ul>
  );
}

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
    return <p className="text-sm text-slate-500">No recent activity.</p>;
  }

  return (
    <ul className="space-y-2">
      {events.map((e) => (
        <li
          key={e.id}
          className="flex justify-between text-sm border-b border-surface-border/50 py-2"
        >
          <span className="font-mono text-xs text-slate-300">{e.eventType}</span>
          <span className="text-slate-500">{new Date(e.createdAt).toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );
}

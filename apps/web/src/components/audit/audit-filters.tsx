"use client";

export function AuditFilters({
  eventType,
  from,
  to,
  onChange,
}: {
  eventType: string;
  from: string;
  to: string;
  onChange: (next: { eventType: string; from: string; to: string }) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      <div>
        <label className="text-xs text-slate-500 block mb-1">Event type</label>
        <input
          className="rounded-md border border-surface-border bg-surface px-3 py-2 text-sm"
          value={eventType}
          onChange={(e) => onChange({ eventType: e.target.value, from, to })}
          placeholder="intent.created"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 block mb-1">From</label>
        <input
          type="date"
          className="rounded-md border border-surface-border bg-surface px-3 py-2 text-sm"
          value={from}
          onChange={(e) => onChange({ eventType, from: e.target.value, to })}
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 block mb-1">To</label>
        <input
          type="date"
          className="rounded-md border border-surface-border bg-surface px-3 py-2 text-sm"
          value={to}
          onChange={(e) => onChange({ eventType, from, to: e.target.value })}
        />
      </div>
    </div>
  );
}

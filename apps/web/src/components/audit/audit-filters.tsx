"use client";

import { Input } from "@/components/ui/input";

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
      <Input
        label="Event type"
        className="min-w-[200px]"
        value={eventType}
        onChange={(e) => onChange({ eventType: e.target.value, from, to })}
        placeholder="intent.created"
      />
      <Input
        label="From"
        type="date"
        value={from}
        onChange={(e) => onChange({ eventType, from: e.target.value, to })}
      />
      <Input
        label="To"
        type="date"
        value={to}
        onChange={(e) => onChange({ eventType, from, to: e.target.value })}
      />
    </div>
  );
}

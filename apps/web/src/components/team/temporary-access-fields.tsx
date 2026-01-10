"use client";

import { Input } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
export function TemporaryAccessFields({
  enabled,
  startsAt,
  endsAt,
  onChange,
}: {
  enabled: boolean;
  startsAt: string;
  endsAt: string;
  onChange: (next: { enabled: boolean; startsAt: string; endsAt: string }) => void;
}) {
  const defaultEnd = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 16);
  };

  return (
    <Card>
      <CardBody className="space-y-3 py-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-300">
          <input
            type="checkbox"
            checked={enabled}
            className="rounded border-surface-border text-brand-500 focus:ring-brand-500/30"
            onChange={(e) =>
              onChange({
                enabled: e.target.checked,
                startsAt: startsAt || new Date().toISOString().slice(0, 16),
                endsAt: endsAt || defaultEnd(),
              })
            }
          />
          Temporary access
        </label>
        {enabled && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Starts"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => onChange({ enabled, startsAt: e.target.value, endsAt })}
            />
            <Input
              label="Ends"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => onChange({ enabled, startsAt, endsAt: e.target.value })}
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
}

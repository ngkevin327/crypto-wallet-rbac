"use client";

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
    <div className="space-y-3 rounded-md border border-surface-border p-3">
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={enabled}
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
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-500">Starts</label>
            <input
              type="datetime-local"
              className="w-full rounded-md border border-surface-border bg-surface px-2 py-1 text-sm"
              value={startsAt}
              onChange={(e) => onChange({ enabled, startsAt: e.target.value, endsAt })}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Ends</label>
            <input
              type="datetime-local"
              className="w-full rounded-md border border-surface-border bg-surface px-2 py-1 text-sm"
              value={endsAt}
              onChange={(e) => onChange({ enabled, startsAt, endsAt: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

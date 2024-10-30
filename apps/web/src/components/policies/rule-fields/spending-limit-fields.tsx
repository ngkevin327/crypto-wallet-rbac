"use client";

interface Props {
  dailyLimit: string;
  perTxLimit: string;
  onDailyChange: (v: string) => void;
  onPerTxChange: (v: string) => void;
}

export function SpendingLimitFields({
  dailyLimit,
  perTxLimit,
  onDailyChange,
  onPerTxChange,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="block text-sm text-slate-300 mb-1">Max USD per day</label>
        <input
          data-testid="policy-daily-limit"
          type="number"
          min={0}
          value={dailyLimit}
          onChange={(e) => onDailyChange(e.target.value)}
          className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm text-slate-300 mb-1">Max USD per transaction</label>
        <input
          data-testid="policy-per-tx-limit"
          type="number"
          min={0}
          value={perTxLimit}
          onChange={(e) => onPerTxChange(e.target.value)}
          className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}

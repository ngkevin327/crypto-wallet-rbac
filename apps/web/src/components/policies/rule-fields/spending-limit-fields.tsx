"use client";

import { Input } from "@/components/ui/input";

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
      <Input
        label="Max USD per day"
        data-testid="policy-daily-limit"
        type="number"
        min={0}
        value={dailyLimit}
        onChange={(e) => onDailyChange(e.target.value)}
      />
      <Input
        label="Max USD per transaction"
        data-testid="policy-per-tx-limit"
        type="number"
        min={0}
        value={perTxLimit}
        onChange={(e) => onPerTxChange(e.target.value)}
      />
    </div>
  );
}

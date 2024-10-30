"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function TokenAllowlistField({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-1">USDC contract address</label>
      <input
        data-testid="policy-token-address"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
        className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm font-mono"
      />
    </div>
  );
}

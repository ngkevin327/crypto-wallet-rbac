"use client";

import { Input } from "@/components/ui/input";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function TokenAllowlistField({ value, onChange }: Props) {
  return (
    <Input
      label="USDC contract address"
      data-testid="policy-token-address"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
      className="font-mono"
    />
  );
}

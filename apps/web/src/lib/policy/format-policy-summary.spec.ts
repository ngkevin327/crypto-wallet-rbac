import { formatPolicySummary } from "./format-policy-summary";

describe("formatPolicySummary", () => {
  it("formats marketing USDC daily cap", () => {
    const summary = formatPolicySummary([
      {
        type: "token_allowlist",
        addresses: ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
      },
      { type: "max_usd_per_day", maxUsd: 2000 },
      { type: "require_approval", approverCount: 2 },
    ]);
    expect(summary).toContain("$2,000");
    expect(summary).toContain("2 approval");
  });
});

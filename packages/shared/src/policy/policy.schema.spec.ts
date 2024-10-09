import { parsePolicyRules, PolicyRulesSchema } from "./policy.schema";
import { INVALID_POLICY_RULE } from "./reason-codes";

const VALID_MARKETING_POLICY = [
  {
    type: "token_allowlist",
    addresses: ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
  },
  { type: "max_usd_per_day", maxUsd: 2000 },
  { type: "require_approval", approverCount: 2 },
];

describe("PolicyRulesSchema", () => {
  it("accepts a valid marketing-style policy", () => {
    const parsed = parsePolicyRules(VALID_MARKETING_POLICY);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.rules).toHaveLength(3);
    }
  });

  it("rejects empty rules array", () => {
    const parsed = parsePolicyRules([]);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.issues[0]?.code).toBe(INVALID_POLICY_RULE);
    }
  });

  it("rejects unknown rule type", () => {
    const parsed = parsePolicyRules([{ type: "unknown_rule", value: 1 }]);
    expect(parsed.success).toBe(false);
  });

  it("rejects duplicate token addresses", () => {
    const addr = "0x1111111111111111111111111111111111111111";
    const parsed = parsePolicyRules([
      { type: "token_allowlist", addresses: [addr, addr] },
    ]);
    expect(parsed.success).toBe(false);
  });

  it("rejects zero max usd per day", () => {
    const parsed = parsePolicyRules([{ type: "max_usd_per_day", maxUsd: 0 }]);
    expect(parsed.success).toBe(false);
  });

  it("rejects require_approval without approverCount", () => {
    const parsed = parsePolicyRules([{ type: "require_approval" }]);
    expect(parsed.success).toBe(false);
  });

  it("rejects invalid ethereum address in allowlist", () => {
    const parsed = parsePolicyRules([
      { type: "token_allowlist", addresses: ["not-an-address"] },
    ]);
    expect(parsed.success).toBe(false);
  });

  it("parses wallet allowlist with uuid wallet ids", () => {
    const walletId = "550e8400-e29b-41d4-a716-446655440000";
    const result = PolicyRulesSchema.safeParse([
      { type: "wallet_allowlist", walletIds: [walletId] },
    ]);
    expect(result.success).toBe(true);
  });

  it("rejects require_approval with empty approverRoleIds array", () => {
    const parsed = parsePolicyRules([
      { type: "require_approval", approverCount: 1, approverRoleIds: [] },
    ]);
    expect(parsed.success).toBe(false);
  });

  it("rejects conflicting zero daily limit", () => {
    const parsed = parsePolicyRules([{ type: "max_usd_per_day", maxUsd: 0 }]);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.issues.some((i) => i.path.includes("maxUsd"))).toBe(true);
    }
  });

  it("accepts max transactions per hour rule", () => {
    const parsed = parsePolicyRules([{ type: "max_transactions_per_hour", maxCount: 5 }]);
    expect(parsed.success).toBe(true);
  });

  it("rejects negative max usd per transaction", () => {
    const parsed = parsePolicyRules([{ type: "max_usd_per_transaction", maxUsd: -1 }]);
    expect(parsed.success).toBe(false);
  });

  it("rejects wallet allowlist without wallet ids", () => {
    const parsed = parsePolicyRules([{ type: "wallet_allowlist", walletIds: [] }]);
    expect(parsed.success).toBe(false);
  });
});

describe("marketing-usdc-2k fixture shape", () => {
  it("matches expected marketing policy rules", () => {
    const fixture = [
      {
        type: "token_allowlist",
        addresses: ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
      },
      { type: "max_usd_per_day", maxUsd: 2000 },
      { type: "require_approval", approverCount: 2 },
    ];
    const parsed = parsePolicyRules(fixture);
    expect(parsed.success).toBe(true);
  });
});

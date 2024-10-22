import { PolicyEvaluator } from "./policy-evaluator";
import type { EvaluationContext } from "./types";

const MARKETING_RULES = [
  {
    type: "token_allowlist" as const,
    addresses: ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"],
  },
  { type: "max_usd_per_day" as const, maxUsd: 2000 },
];

describe("PolicyEvaluator integration", () => {
  const evaluator = new PolicyEvaluator();

  it("returns ALLOW for marketing ruleset under $2K daily", () => {
    const ctx: EvaluationContext = {
      orgId: "o1",
      memberId: "m1",
      walletId: "w1",
      tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      chainId: 1,
      amountUsd: 1500,
      counters: { dailyUsdSpent: 0, txCountLastHour: 0 },
      actorRoleIds: [],
    };
    const decision = evaluator.evaluate(ctx, MARKETING_RULES);
    expect(decision.decision).toBe("ALLOW");
  });
});

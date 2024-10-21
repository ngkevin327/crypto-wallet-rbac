import { MaxUsdPerDayHandler } from "./max-usd-per-day.handler";
import type { EvaluationContext } from "../types";

describe("MaxUsdPerDayHandler", () => {
  const handler = new MaxUsdPerDayHandler();

  it("allows when under daily cap", () => {
    const ctx: EvaluationContext = {
      orgId: "o1",
      memberId: "m1",
      walletId: "w1",
      tokenAddress: "0xabc",
      chainId: 1,
      amountUsd: 500,
      counters: { dailyUsdSpent: 1000, txCountLastHour: 0 },
      actorRoleIds: [],
    };
    const result = handler.evaluate(ctx, { type: "max_usd_per_day", maxUsd: 2000 });
    expect(result.decision).toBe("ALLOW");
  });

  it("denies when projected spend exceeds cap", () => {
    const ctx: EvaluationContext = {
      orgId: "o1",
      memberId: "m1",
      walletId: "w1",
      tokenAddress: "0xabc",
      chainId: 1,
      amountUsd: 600,
      counters: { dailyUsdSpent: 1500, txCountLastHour: 0 },
      actorRoleIds: [],
    };
    const result = handler.evaluate(ctx, { type: "max_usd_per_day", maxUsd: 2000 });
    expect(result.decision).toBe("DENY");
    expect(result.metadata?.remainingUsd).toBe(500);
  });
});

import { MaxTxPerHourHandler } from "./max-tx-per-hour.handler";
import type { EvaluationContext } from "../types";

describe("MaxTxPerHourHandler", () => {
  const handler = new MaxTxPerHourHandler();

  it("blocks fourth transaction when limit is 3 per hour", () => {
    const ctx: EvaluationContext = {
      orgId: "o1",
      memberId: "m1",
      walletId: "w1",
      tokenAddress: "0xabc",
      chainId: 1,
      amountUsd: 1,
      counters: { dailyUsdSpent: 0, txCountLastHour: 3 },
      actorRoleIds: [],
    };
    const result = handler.evaluate(ctx, {
      type: "max_transactions_per_hour",
      maxCount: 3,
    });
    expect(result.decision).toBe("DENY");
  });
});

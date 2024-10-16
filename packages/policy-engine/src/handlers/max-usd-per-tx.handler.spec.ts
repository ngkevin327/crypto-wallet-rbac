import { MaxUsdPerTxHandler } from "./max-usd-per-tx.handler";
import type { EvaluationContext } from "../types";

const base: EvaluationContext = {
  orgId: "o1",
  memberId: "m1",
  walletId: "w1",
  tokenAddress: "0xabc",
  chainId: 1,
  amountUsd: 100,
  counters: { dailyUsdSpent: 0, txCountLastHour: 0 },
  actorRoleIds: [],
};

describe("MaxUsdPerTxHandler", () => {
  const handler = new MaxUsdPerTxHandler();

  it("allows at exact boundary", () => {
    const result = handler.evaluate(
      { ...base, amountUsd: 500 },
      { type: "max_usd_per_transaction", maxUsd: 500 }
    );
    expect(result.decision).toBe("ALLOW");
  });

  it("denies one cent over limit", () => {
    const result = handler.evaluate(
      { ...base, amountUsd: 500.01 },
      { type: "max_usd_per_transaction", maxUsd: 500 }
    );
    expect(result.decision).toBe("DENY");
  });

  it("denies when amount unknown", () => {
    const result = handler.evaluate(
      { ...base, amountUsd: null },
      { type: "max_usd_per_transaction", maxUsd: 500 }
    );
    expect(result.decision).toBe("DENY");
  });
});

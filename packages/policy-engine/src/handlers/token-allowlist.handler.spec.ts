import { TokenAllowlistHandler } from "./token-allowlist.handler";
import type { EvaluationContext } from "../types";

const baseContext: EvaluationContext = {
  orgId: "o1",
  memberId: "m1",
  walletId: "w1",
  tokenAddress: "0xabc",
  chainId: 1,
  amountUsd: 10,
  counters: { dailyUsdSpent: 0, txCountLastHour: 0 },
  actorRoleIds: [],
};

describe("TokenAllowlistHandler", () => {
  const handler = new TokenAllowlistHandler();

  it("allows listed token", () => {
    const result = handler.evaluate(baseContext, {
      type: "token_allowlist",
      addresses: ["0xABC"],
    });
    expect(result.decision).toBe("ALLOW");
  });

  it("denies unlisted token", () => {
    const result = handler.evaluate(baseContext, {
      type: "token_allowlist",
      addresses: ["0x1111111111111111111111111111111111111111"],
    });
    expect(result.decision).toBe("DENY");
  });
});

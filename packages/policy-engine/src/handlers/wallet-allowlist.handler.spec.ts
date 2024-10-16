import { WalletAllowlistHandler } from "./wallet-allowlist.handler";
import type { EvaluationContext } from "../types";

const baseContext: EvaluationContext = {
  orgId: "o1",
  memberId: "m1",
  walletId: "wallet-a",
  tokenAddress: "0xabc",
  chainId: 1,
  amountUsd: 10,
  counters: { dailyUsdSpent: 0, txCountLastHour: 0 },
  actorRoleIds: [],
};

describe("WalletAllowlistHandler", () => {
  const handler = new WalletAllowlistHandler();

  it("allows scoped wallet", () => {
    const result = handler.evaluate(baseContext, {
      type: "wallet_allowlist",
      walletIds: ["wallet-a"],
    });
    expect(result.decision).toBe("ALLOW");
  });

  it("denies other wallets", () => {
    const result = handler.evaluate(baseContext, {
      type: "wallet_allowlist",
      walletIds: ["wallet-b"],
    });
    expect(result.decision).toBe("DENY");
  });
});

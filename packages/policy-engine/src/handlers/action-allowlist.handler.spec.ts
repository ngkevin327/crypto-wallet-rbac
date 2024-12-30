import { ActionAllowlistHandler } from "./action-allowlist.handler";
import type { EvaluationContext } from "../types";

function baseContext(overrides: Partial<EvaluationContext> = {}): EvaluationContext {
  return {
    orgId: "org-1",
    memberId: "member-1",
    walletId: "wallet-1",
    tokenAddress: "0x0000000000000000000000000000000000000000",
    chainId: 1,
    amountUsd: 0,
    counters: { dailyUsdSpent: 0, txCountLastHour: 0 },
    actorRoleIds: [],
    intentAction: "transfer",
    ...overrides,
  };
}

describe("ActionAllowlistHandler", () => {
  const handler = new ActionAllowlistHandler();

  it("allows transfer when listed", () => {
    const result = handler.evaluate(baseContext(), {
      type: "action_allowlist",
      actions: ["transfer"],
    });
    expect(result.decision).toBe("ALLOW");
  });

  it("denies deploy when not listed", () => {
    const result = handler.evaluate(
      baseContext({ intentAction: "deploy" }),
      { type: "action_allowlist", actions: ["transfer"] }
    );
    expect(result.decision).toBe("DENY");
    expect(result.reasons).toContain("ACTION_NOT_ALLOWED");
  });

  it("allows deploy when listed", () => {
    const result = handler.evaluate(
      baseContext({ intentAction: "deploy" }),
      { type: "action_allowlist", actions: ["transfer", "deploy"] }
    );
    expect(result.decision).toBe("ALLOW");
  });
});

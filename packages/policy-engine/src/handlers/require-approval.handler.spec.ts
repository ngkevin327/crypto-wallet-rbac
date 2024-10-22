import { RequireApprovalHandler } from "./require-approval.handler";
import type { EvaluationContext } from "../types";

describe("RequireApprovalHandler", () => {
  const handler = new RequireApprovalHandler();

  it("requires approval for positive amounts", () => {
    const ctx: EvaluationContext = {
      orgId: "o1",
      memberId: "m1",
      walletId: "w1",
      tokenAddress: "0xabc",
      chainId: 1,
      amountUsd: 100,
      counters: { dailyUsdSpent: 0, txCountLastHour: 0 },
      actorRoleIds: [],
    };
    const result = handler.evaluate(ctx, {
      type: "require_approval",
      approverCount: 2,
      approverRoleIds: ["role-finance"],
    });
    expect(result.decision).toBe("REQUIRE_APPROVAL");
    expect(result.metadata?.approval).toEqual({
      approverCount: 2,
      approverRoleIds: ["role-finance"],
    });
  });
});

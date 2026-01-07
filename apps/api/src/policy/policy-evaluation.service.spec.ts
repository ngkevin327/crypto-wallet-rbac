import { PolicyEvaluationService } from "./policy-evaluation.service";
import { PriceUnavailableError } from "../integration/errors/price-unavailable.error";
import { POLICY_DENIED_PRICE_UNAVAILABLE } from "@wtp/shared/policy/reason-codes";
import { PolicyResolverService } from "./policy-resolver.service";
import { RateCounterService } from "./rate-counter.service";

describe("PolicyEvaluationService", () => {
  const oracle = { getUsdPrice: jest.fn() };
  const resolver = {
    getApplicablePoliciesForOrg: jest.fn().mockResolvedValue([
      { type: "max_usd_per_day", maxUsd: 2000 },
    ]),
  } as unknown as PolicyResolverService;
  const counters = {
    getCounters: jest.fn().mockResolvedValue({ dailyUsdSpent: 0, txCountLastHour: 0 }),
  } as unknown as RateCounterService;
  const metrics = {
    timing: jest.fn(),
  };

  let service: PolicyEvaluationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PolicyEvaluationService(oracle as never, resolver, counters, metrics as never);
  });

  it("returns DENY when oracle is unavailable (fail-closed)", async () => {
    oracle.getUsdPrice.mockRejectedValue(new PriceUnavailableError("timeout", 1, "0xabc"));

    const decision = await service.evaluateIntent({
      orgId: "org",
      memberId: "m1",
      walletId: "w1",
      tokenAddress: "0x1c7d4b196cb0c7b4b7ba5bbd7412162b4c447b4",
      chainId: 11155111,
      amountNative: "100",
    });

    expect(decision.decision).toBe("DENY");
    expect(decision.reasons).toContain(POLICY_DENIED_PRICE_UNAVAILABLE);
  });

  it("evaluates rules when price is available", async () => {
    oracle.getUsdPrice.mockResolvedValue(1);

    const decision = await service.evaluateIntent({
      orgId: "org",
      memberId: "m1",
      walletId: "w1",
      tokenAddress: "0x1c7d4b196cb0c7b4b7ba5bbd7412162b4c447b4",
      chainId: 11155111,
      amountNative: "100",
    });

    expect(decision.decision).toBe("ALLOW");
  });

  it("returns fail-closed stub decision", () => {
    const decision = service.priceUnavailableDecision();
    expect(decision.decision).toBe("DENY");
  });
});

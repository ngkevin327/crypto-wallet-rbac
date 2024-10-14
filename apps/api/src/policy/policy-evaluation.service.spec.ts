import { PolicyEvaluationService } from "./policy-evaluation.service";
import { PriceUnavailableError } from "../integration/errors/price-unavailable.error";
import { POLICY_DENIED_PRICE_UNAVAILABLE } from "@wtp/shared/policy/reason-codes";

describe("PolicyEvaluationService", () => {
  const oracle = { getUsdPrice: jest.fn() };
  let service: PolicyEvaluationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PolicyEvaluationService(oracle as never);
  });

  it("returns null amount when oracle fails", async () => {
    oracle.getUsdPrice.mockRejectedValue(new PriceUnavailableError("timeout", 1, "0xabc"));
    const amount = await service.resolveAmountUsd(1, "0xabc", "100");
    expect(amount).toBeNull();
  });

  it("returns fail-closed DENY decision envelope", () => {
    const decision = service.priceUnavailableDecision();
    expect(decision.decision).toBe("DENY");
    expect(decision.reasons).toContain(POLICY_DENIED_PRICE_UNAVAILABLE);
  });

  it("resolves USD amount when oracle succeeds", async () => {
    oracle.getUsdPrice.mockResolvedValue(2);
    const amount = await service.resolveAmountUsd(1, "0xabc", "100");
    expect(amount).toBe(200);
  });
});

import { NotFoundException } from "@nestjs/common";
import { PolicyDeniedException } from "../common/errors/policy-denied.exception";
import { Test } from "@nestjs/testing";
import { IntentStatus } from "@prisma/client";
import { PolicyEvaluationService } from "../policy/policy-evaluation.service";
import { PolicyResolverService } from "../policy/policy-resolver.service";
import { RateCounterService } from "../policy/rate-counter.service";
import { PrismaService } from "../database/prisma.service";
import { IntentRepository } from "./intent.repository";
import { IntentService } from "./intent.service";

describe("IntentService", () => {
  let service: IntentService;
  const prisma = {
    wallet: { findFirst: jest.fn() },
  };
  const repository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByOrg: jest.fn(),
  };
  const policyEvaluation = {
    evaluateIntent: jest.fn(),
    resolveAmountUsd: jest.fn(),
  };
  const rateCounters = {
    incrementDailyUsd: jest.fn(),
    incrementHourlyTx: jest.fn(),
  };
  const policyResolver = {
    resolvePolicyVersionId: jest.fn().mockResolvedValue("policy-1"),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        IntentService,
        { provide: PrismaService, useValue: prisma },
        { provide: IntentRepository, useValue: repository },
        { provide: PolicyEvaluationService, useValue: policyEvaluation },
        { provide: PolicyResolverService, useValue: policyResolver },
        { provide: RateCounterService, useValue: rateCounters },
      ],
    }).compile();
    service = moduleRef.get(IntentService);
  });

  const dto = {
    walletId: "wallet-1",
    tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    chainId: 11155111,
    amountNative: "1000000",
    toAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  };

  it("creates intent with ready_to_sign on ALLOW", async () => {
    prisma.wallet.findFirst.mockResolvedValue({ id: "wallet-1" });
    policyEvaluation.evaluateIntent.mockResolvedValue({
      decision: "ALLOW",
      reasons: [],
      matchedRules: [],
    });
    policyEvaluation.resolveAmountUsd.mockResolvedValue(1);
    repository.create.mockResolvedValue({
      id: "intent-1",
      status: IntentStatus.ready_to_sign,
    });

    const result = await service.create("org-1", "member-1", dto);

    expect(result.intent.status).toBe(IntentStatus.ready_to_sign);
    expect(rateCounters.incrementDailyUsd).toHaveBeenCalledWith("org-1", "member-1", 1);
    expect(rateCounters.incrementHourlyTx).toHaveBeenCalled();
  });

  it("creates intent with pending_approval on REQUIRE_APPROVAL", async () => {
    prisma.wallet.findFirst.mockResolvedValue({ id: "wallet-1" });
    policyEvaluation.evaluateIntent.mockResolvedValue({
      decision: "REQUIRE_APPROVAL",
      reasons: ["POLICY_DENIED_APPROVAL_REQUIRED"],
      matchedRules: [],
      metadata: { approval: { approverCount: 2 } },
    });
    policyEvaluation.resolveAmountUsd.mockResolvedValue(8000);
    repository.create.mockResolvedValue({
      id: "intent-2",
      status: IntentStatus.pending_approval,
    });

    const result = await service.create("org-1", "member-1", dto);

    expect(result.intent.status).toBe(IntentStatus.pending_approval);
    expect(rateCounters.incrementDailyUsd).not.toHaveBeenCalled();
  });

  it("creates intent with denied on DENY", async () => {
    prisma.wallet.findFirst.mockResolvedValue({ id: "wallet-1" });
    policyEvaluation.evaluateIntent.mockResolvedValue({
      decision: "DENY",
      reasons: ["POLICY_DENIED_MAX_USD"],
      matchedRules: [],
    });
    policyEvaluation.resolveAmountUsd.mockResolvedValue(10000);
    repository.create.mockResolvedValue({
      id: "intent-3",
      status: IntentStatus.denied,
    });

    const result = await service.create("org-1", "member-1", dto);

    expect(result.intent.status).toBe(IntentStatus.denied);
  });

  it("throws PolicyDeniedException after persisting denied intent", async () => {
    prisma.wallet.findFirst.mockResolvedValue({ id: "wallet-1" });
    policyEvaluation.evaluateIntent.mockResolvedValue({
      decision: "DENY",
      reasons: ["POLICY_DENIED_MAX_USD_PER_TX"],
      matchedRules: [],
    });
    policyEvaluation.resolveAmountUsd.mockResolvedValue(10000);
    repository.create.mockResolvedValue({
      id: "intent-deny",
      status: IntentStatus.denied,
    });

    await expect(service.create("org-1", "member-1", dto)).rejects.toThrow(
      PolicyDeniedException
    );
  });

  it("throws when wallet missing", async () => {
    prisma.wallet.findFirst.mockResolvedValue(null);
    await expect(service.create("org-1", "member-1", dto)).rejects.toThrow(
      NotFoundException
    );
  });
});

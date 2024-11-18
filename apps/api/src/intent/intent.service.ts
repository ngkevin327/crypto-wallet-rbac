import { Injectable, NotFoundException } from "@nestjs/common";
import { IntentStatus, Prisma } from "@prisma/client";
import type { PolicyDecision } from "@wtp/policy-engine";
import {
  policyEventFromDecision,
  transitionIntentStatus,
} from "@wtp/shared/intent/intent-state-machine";
import { PolicyDeniedException } from "../common/errors/policy-denied.exception";
import { PrismaService } from "../database/prisma.service";
import { PolicyEvaluationService } from "../policy/policy-evaluation.service";
import { PolicyResolverService } from "../policy/policy-resolver.service";
import { RateCounterService } from "../policy/rate-counter.service";
import type { CreateIntentDto } from "./dto/create-intent.dto";
import { IntentRepository } from "./intent.repository";

@Injectable()
export class IntentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: IntentRepository,
    private readonly policyEvaluation: PolicyEvaluationService,
    private readonly policyResolver: PolicyResolverService,
    private readonly rateCounters: RateCounterService
  ) {}

  async create(orgId: string, memberId: string, dto: CreateIntentDto) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: dto.walletId, organizationId: orgId },
    });
    if (!wallet) {
      throw new NotFoundException({
        code: "WALLET_NOT_FOUND",
        message: "Wallet not found in this organization",
      });
    }

    const decision = await this.policyEvaluation.evaluateIntent({
      orgId,
      memberId,
      walletId: dto.walletId,
      tokenAddress: dto.tokenAddress,
      chainId: dto.chainId,
      amountNative: dto.amountNative,
    });

    const amountUsd = await this.policyEvaluation.resolveAmountUsd(
      dto.chainId,
      dto.tokenAddress,
      dto.amountNative
    );

    const status = transitionIntentStatus(
      "draft",
      policyEventFromDecision(decision.decision)
    );

    const policyVersionId = await this.policyResolver.resolvePolicyVersionId(
      orgId,
      memberId,
      dto.walletId
    );

    const intent = await this.repository.create({
      organizationId: orgId,
      walletId: dto.walletId,
      memberId,
      tokenAddress: dto.tokenAddress,
      chainId: dto.chainId,
      amountNative: dto.amountNative,
      amountUsd,
      toAddress: dto.toAddress,
      calldata: dto.calldata ?? null,
      status,
      policyVersionId,
      policyDecisionJson: IntentService.decisionSnapshot(decision),
    });

    if (decision.decision === "ALLOW" && amountUsd != null) {
      await this.rateCounters.incrementDailyUsd(orgId, memberId, amountUsd);
      await this.rateCounters.incrementHourlyTx(orgId, memberId);
    }

    if (decision.decision === "DENY") {
      throw new PolicyDeniedException(decision.reasons, intent.id);
    }

    return { intent, decision };
  }

  async getById(intentId: string) {
    const intent = await this.repository.findById(intentId);
    if (!intent) {
      throw new NotFoundException({
        code: "INTENT_NOT_FOUND",
        message: "Intent not found",
      });
    }
    return intent;
  }

  async listByOrg(
    orgId: string,
    filters: { status?: IntentStatus; memberId?: string }
  ) {
    return this.repository.findByOrg(orgId, filters);
  }

  static decisionSnapshot(decision: PolicyDecision): Prisma.InputJsonValue {
    return decision as unknown as Prisma.InputJsonValue;
  }
}

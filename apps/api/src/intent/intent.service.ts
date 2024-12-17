import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { IntentSource, IntentStatus, IntentType, MemberStatus, Prisma } from "@prisma/client";
import type { PolicyDecision } from "@wtp/policy-engine";
import {
  policyEventFromDecision,
  transitionIntentStatus,
} from "@wtp/shared/intent/intent-state-machine";
import { ApprovalService } from "../approval/approval.service";
import { AuditService } from "../audit/audit.service";
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
    private readonly rateCounters: RateCounterService,
    private readonly audit: AuditService,
    private readonly approvals: ApprovalService
  ) {}

  async create(
    orgId: string,
    memberId: string,
    dto: CreateIntentDto,
    meta?: { source?: IntentSource; apiKeyId?: string }
  ) {
    const intentType: IntentType =
      dto.type === "deploy" ? IntentType.deploy : IntentType.transfer;

    const wallet = await this.prisma.wallet.findFirst({
      where: { id: dto.walletId, organizationId: orgId },
    });
    if (!wallet) {
      throw new NotFoundException({
        code: "WALLET_NOT_FOUND",
        message: "Wallet not found in this organization",
      });
    }

    const tokenAddress =
      intentType === IntentType.deploy
        ? "0x0000000000000000000000000000000000000000"
        : (dto.tokenAddress as string);
    const amountNative = intentType === IntentType.deploy ? "0" : (dto.amountNative as string);
    const toAddress =
      intentType === IntentType.deploy
        ? "0x0000000000000000000000000000000000000000"
        : (dto.toAddress as string);
    const calldata =
      intentType === IntentType.deploy
        ? (dto.bytecode ?? dto.calldata ?? "0x")
        : (dto.calldata ?? null);

    const decision = await this.policyEvaluation.evaluateIntent({
      orgId,
      memberId,
      walletId: dto.walletId,
      tokenAddress,
      chainId: dto.chainId,
      amountNative,
      intentAction: intentType === IntentType.deploy ? "deploy" : "transfer",
    });

    const amountUsd =
      intentType === IntentType.deploy
        ? 0
        : await this.policyEvaluation.resolveAmountUsd(
            dto.chainId,
            tokenAddress,
            amountNative
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
      intentType,
      source: meta?.source ?? IntentSource.web,
      apiKeyId: meta?.apiKeyId ?? null,
      tokenAddress,
      chainId: dto.chainId,
      amountNative,
      amountUsd,
      toAddress,
      calldata,
      status,
      policyVersionId,
      policyDecisionJson: IntentService.decisionSnapshot(decision),
    });

    if (decision.decision === "ALLOW" && amountUsd != null) {
      await this.rateCounters.incrementDailyUsd(orgId, memberId, amountUsd);
      await this.rateCounters.incrementHourlyTx(orgId, memberId);
    }

    const auditPayload = {
      intentId: intent.id,
      intentType,
      amountUsd,
      tokenAddress,
      decision: decision.decision,
      reasons: decision.reasons,
      ...(meta?.apiKeyId ? { apiKeyId: meta.apiKeyId } : {}),
    };

    if (decision.decision === "DENY") {
      await this.audit.appendIntentPolicyDenied(orgId, memberId, {
        intentId: intent.id,
        amountUsd,
        tokenAddress,
        reasons: decision.reasons,
      });
      throw new PolicyDeniedException(decision.reasons, intent.id);
    }

    if (decision.decision === "REQUIRE_APPROVAL") {
      await this.approvals.createForIntent(intent.id, orgId, decision);
    }

    await this.audit.appendIntentCreated(orgId, memberId, auditPayload);

    return { intent, decision };
  }

  async getById(intentId: string, userId: string) {
    const intent = await this.repository.findById(intentId);
    if (!intent) {
      throw new NotFoundException({
        code: "INTENT_NOT_FOUND",
        message: "Intent not found",
      });
    }
    const member = await this.prisma.member.findFirst({
      where: {
        organizationId: intent.organizationId,
        userId,
        status: MemberStatus.active,
      },
    });
    if (!member) {
      throw new ForbiddenException({ code: "ORG_ACCESS_DENIED" });
    }
    return intent;
  }

  async listByOrg(
    orgId: string,
    filters: { status?: IntentStatus; memberId?: string }
  ) {
    return this.repository.findByOrg(orgId, filters);
  }

  async cancelByMember(memberId: string, reason: string): Promise<number> {
    const cancellable: IntentStatus[] = [
      IntentStatus.pending_approval,
      IntentStatus.ready_to_sign,
      IntentStatus.policy_evaluated,
    ];
    const result = await this.prisma.transactionIntent.updateMany({
      where: {
        memberId,
        status: { in: cancellable },
      },
      data: {
        status: IntentStatus.cancelled,
        failureReason: reason,
      },
    });
    return result.count;
  }

  static decisionSnapshot(decision: PolicyDecision): Prisma.InputJsonValue {
    return decision as unknown as Prisma.InputJsonValue;
  }
}

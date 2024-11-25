import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  ApprovalDecisionType,
  ApprovalRequestStatus,
  IntentStatus,
  MemberStatus,
} from "@prisma/client";
import type { PolicyDecision } from "@wtp/policy-engine";
import { transitionIntentStatus } from "@wtp/shared/intent/intent-state-machine";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../database/prisma.service";
import { isQuorumMet } from "./approval-quorum.calculator";
import { ApprovalRepository } from "./approval.repository";

const DEFAULT_EXPIRY_HOURS = Number(process.env.APPROVAL_EXPIRY_HOURS ?? 72);

@Injectable()
export class ApprovalService {
  constructor(
    private readonly repository: ApprovalRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async createForIntent(
    intentId: string,
    organizationId: string,
    decision: PolicyDecision
  ) {
    if (decision.decision !== "REQUIRE_APPROVAL") {
      return null;
    }

    const approval = decision.metadata?.approval;
    if (!approval) {
      return null;
    }

    const approverRoleIds = approval.approverRoleIds ?? [];
    const expiresAt = new Date(Date.now() + DEFAULT_EXPIRY_HOURS * 60 * 60 * 1000);

    const request = await this.repository.createRequest({
      intentId,
      requiredCount: approval.approverCount,
      approverRoleIds,
      expiresAt,
    });

    await this.repository.updateIntentStatus(intentId, IntentStatus.pending_approval);

    await this.audit.append({
      eventType: "intent.approval_requested",
      organizationId,
      payload: {
        intentId,
        requestId: request.id,
        requiredCount: approval.approverCount,
        approverRoleIds,
        expiresAt: expiresAt.toISOString(),
      },
    });

    return request;
  }

  async resolveEligibleApproverMemberIds(
    orgId: string,
    approverRoleIds: string[]
  ): Promise<string[]> {
    if (!approverRoleIds.length) {
      const members = await this.prisma.member.findMany({
        where: { organizationId: orgId, status: MemberStatus.active },
        select: { id: true },
      });
      return members.map((m) => m.id);
    }

    const now = new Date();
    const assignments = await this.prisma.roleAssignment.findMany({
      where: {
        roleId: { in: approverRoleIds },
        member: { organizationId: orgId, status: MemberStatus.active },
        startsAt: { lte: now },
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      },
      select: { memberId: true },
    });
    return [...new Set(assignments.map((a) => a.memberId))];
  }

  async recordDecision(
    requestId: string,
    memberId: string,
    decision: ApprovalDecisionType,
    note?: string
  ) {
    const request = await this.repository.findById(requestId);
    if (!request) {
      throw new NotFoundException({ code: "APPROVAL_NOT_FOUND" });
    }
    if (request.status !== ApprovalRequestStatus.pending) {
      throw new ConflictException({ code: "APPROVAL_NOT_PENDING" });
    }

    const eligible = await this.resolveEligibleApproverMemberIds(
      request.intent.organizationId,
      request.approverRoleIds
    );
    if (!eligible.includes(memberId)) {
      throw new ForbiddenException({ code: "NOT_ELIGIBLE_APPROVER" });
    }

    const existing = await this.repository.hasMemberDecision(requestId, memberId);
    if (existing) {
      throw new ConflictException({ code: "APPROVAL_ALREADY_DECIDED" });
    }

    await this.repository.createDecision({ requestId, memberId, decision, note });

    const orgId = request.intent.organizationId;
    const intentId = request.intent.id;

    if (decision === ApprovalDecisionType.rejected) {
      await this.repository.updateRequestStatus(requestId, ApprovalRequestStatus.rejected);
      await this.repository.updateIntentStatus(
        intentId,
        transitionIntentStatus("pending_approval", "APPROVAL_REJECTED")
      );
      await this.audit.appendApprovalRejected(orgId, memberId, {
        requestId,
        intentId,
      });
      return this.repository.findById(requestId);
    }

    const approvalCount = await this.repository.countApprovals(requestId);
    if (isQuorumMet(approvalCount, request.requiredCount)) {
      await this.repository.updateRequestStatus(requestId, ApprovalRequestStatus.fulfilled);
      await this.repository.updateIntentStatus(
        intentId,
        transitionIntentStatus("pending_approval", "APPROVAL_COMPLETED")
      );
    }

    await this.audit.appendApprovalGranted(orgId, memberId, {
      requestId,
      intentId,
      approvalCount,
    });

    return this.repository.findById(requestId);
  }

  async listPending(orgId: string) {
    return this.repository.findPendingForOrg(orgId);
  }

  async getRequestById(requestId: string) {
    const request = await this.repository.findById(requestId);
    if (!request) {
      throw new NotFoundException({ code: "APPROVAL_NOT_FOUND" });
    }
    return request;
  }

  async expireRequest(requestId: string) {
    const request = await this.repository.findById(requestId);
    if (!request || request.status !== ApprovalRequestStatus.pending) {
      return;
    }
    await this.repository.updateRequestStatus(requestId, ApprovalRequestStatus.expired);
    await this.repository.updateIntentStatus(
      request.intentId,
      transitionIntentStatus("pending_approval", "APPROVAL_EXPIRED")
    );
    await this.audit.appendApprovalRejected(request.intent.organizationId, "", {
      requestId,
      intentId: request.intentId,
      reason: "expired",
    });
  }

  async expireStaleRequests() {
    const stale = await this.repository.findExpiredPending(new Date());
    for (const request of stale) {
      await this.expireRequest(request.id);
    }
    return stale.length;
  }
}

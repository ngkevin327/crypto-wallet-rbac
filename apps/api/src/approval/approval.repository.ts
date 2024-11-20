import { Injectable } from "@nestjs/common";
import {
  ApprovalDecisionType,
  ApprovalRequestStatus,
  IntentStatus,
} from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class ApprovalRepository {
  constructor(private readonly prisma: PrismaService) {}

  createRequest(data: {
    intentId: string;
    requiredCount: number;
    approverRoleIds: string[];
    expiresAt: Date;
  }) {
    return this.prisma.approvalRequest.create({ data });
  }

  findById(id: string) {
    return this.prisma.approvalRequest.findUnique({
      where: { id },
      include: {
        intent: true,
        decisions: { include: { member: true } },
      },
    });
  }

  findPendingForOrg(orgId: string) {
    return this.prisma.approvalRequest.findMany({
      where: {
        status: ApprovalRequestStatus.pending,
        intent: { organizationId: orgId },
      },
      include: { intent: true, decisions: true },
      orderBy: { expiresAt: "asc" },
    });
  }

  findExpiredPending(before: Date) {
    return this.prisma.approvalRequest.findMany({
      where: {
        status: ApprovalRequestStatus.pending,
        expiresAt: { lt: before },
      },
      include: { intent: true },
    });
  }

  createDecision(data: {
    requestId: string;
    memberId: string;
    decision: ApprovalDecisionType;
    note?: string;
  }) {
    return this.prisma.approvalDecision.create({ data });
  }

  updateRequestStatus(id: string, status: ApprovalRequestStatus) {
    return this.prisma.approvalRequest.update({
      where: { id },
      data: { status },
    });
  }

  countApprovals(requestId: string): Promise<number> {
    return this.prisma.approvalDecision.count({
      where: { requestId, decision: ApprovalDecisionType.approved },
    });
  }

  hasMemberDecision(requestId: string, memberId: string) {
    return this.prisma.approvalDecision.findUnique({
      where: { requestId_memberId: { requestId, memberId } },
    });
  }

  updateIntentStatus(
    intentId: string,
    status: IntentStatus,
    extra?: { failureReason?: string }
  ) {
    return this.prisma.transactionIntent.update({
      where: { id: intentId },
      data: { status, ...extra },
    });
  }
}

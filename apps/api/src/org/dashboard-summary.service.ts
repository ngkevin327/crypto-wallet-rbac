import { Injectable } from "@nestjs/common";
import { IntentStatus } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class DashboardSummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(orgId: string) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      pendingApprovals,
      intentsLast24h,
      policyDenials24h,
      recentAudit,
    ] = await Promise.all([
      this.prisma.approvalRequest.count({
        where: {
          status: "pending",
          intent: { organizationId: orgId },
        },
      }),
      this.prisma.transactionIntent.count({
        where: { organizationId: orgId, createdAt: { gte: since } },
      }),
      this.prisma.transactionIntent.count({
        where: {
          organizationId: orgId,
          status: IntentStatus.denied,
          createdAt: { gte: since },
        },
      }),
      this.prisma.auditEvent.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    return {
      pendingApprovals,
      intentsLast24h,
      policyDenials24h,
      recentActivity: recentAudit.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        actorId: e.actorId,
        createdAt: e.createdAt.toISOString(),
        payload: e.payload,
      })),
    };
  }
}

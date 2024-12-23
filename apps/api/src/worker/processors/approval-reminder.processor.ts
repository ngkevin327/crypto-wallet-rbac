import { Injectable, Logger } from "@nestjs/common";
import { ApprovalRequestStatus } from "@prisma/client";
import { NotificationDispatcherService } from "../../notifications/notification-dispatcher.service";
import { PrismaService } from "../../database/prisma.service";
import type { ApprovalReminderJobPayload } from "../queues";

const HOUR_MS = 60 * 60 * 1000;

@Injectable()
export class ApprovalReminderProcessor {
  private readonly logger = new Logger(ApprovalReminderProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationDispatcherService
  ) {}

  async handle(payload: ApprovalReminderJobPayload): Promise<void> {
    if (!payload.cron) {
      return;
    }

    const now = Date.now();
    const pending = await this.prisma.approvalRequest.findMany({
      where: { status: ApprovalRequestStatus.pending },
      include: {
        intent: {
          include: {
            organization: true,
            member: { include: { user: true } },
          },
        },
      },
    });

    let sent = 0;
    for (const request of pending) {
      const ageMs = now - request.createdAt.getTime();
      const org = request.intent.organization;
      const orgName = org.name;

      if (ageMs >= 24 * HOUR_MS && !request.reminder24hSentAt) {
        await this.sendReminders(request, orgName);
        await this.prisma.approvalRequest.update({
          where: { id: request.id },
          data: { reminder24hSentAt: new Date() },
        });
        sent++;
      } else if (ageMs >= 72 * HOUR_MS && !request.reminder72hSentAt) {
        await this.sendReminders(request, orgName);
        await this.prisma.approvalRequest.update({
          where: { id: request.id },
          data: { reminder72hSentAt: new Date() },
        });
        sent++;
      }
    }

    if (sent > 0) {
      this.logger.log(`Sent ${sent} approval reminder batch(es)`);
    }
  }

  private async sendReminders(
    request: {
      id: string;
      intentId: string;
      requiredCount: number;
      approverRoleIds: string[];
      createdAt: Date;
      intent: { organizationId: string };
    },
    orgName: string
  ): Promise<void> {
    const memberIds = await this.resolveApproverMemberIds(
      request.intent.organizationId,
      request.approverRoleIds
    );
    const members = await this.prisma.member.findMany({
      where: { id: { in: memberIds } },
      include: { user: true },
    });
    const pendingSince = request.createdAt.toISOString();
    await Promise.all(
      members.map((m) =>
        this.notifications.sendApprovalReminder(
          m.user.email,
          orgName,
          request.intentId,
          pendingSince
        )
      )
    );
  }

  private async resolveApproverMemberIds(
    orgId: string,
    approverRoleIds: string[]
  ): Promise<string[]> {
    if (!approverRoleIds.length) {
      const admins = await this.prisma.member.findMany({
        where: { organizationId: orgId, platformRole: "org_admin", status: "active" },
        select: { id: true },
      });
      return admins.map((m) => m.id);
    }
    const assignments = await this.prisma.roleAssignment.findMany({
      where: {
        roleId: { in: approverRoleIds },
        status: "active",
        member: { organizationId: orgId, status: "active" },
      },
      select: { memberId: true },
    });
    return [...new Set(assignments.map((a) => a.memberId))];
  }
}

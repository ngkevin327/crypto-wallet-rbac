import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { EmailPort } from "./email.port";
import { TemplateService } from "./template.service";

@Injectable()
export class NotificationDispatcherService {
  constructor(
    private readonly email: EmailPort,
    private readonly templates: TemplateService,
    private readonly prisma: PrismaService
  ) {}

  private webBaseUrl(): string {
    return process.env.WEB_APP_URL ?? "http://localhost:3000";
  }

  async sendInviteEmail(to: string, orgName: string, rawToken: string): Promise<void> {
    const text = this.templates.render("invite", {
      orgName,
      acceptUrl: `${this.webBaseUrl()}/invite?token=${rawToken}`,
    });
    await this.email.send({
      to,
      subject: `Invitation to ${orgName}`,
      text,
    });
  }

  async sendApprovalRequired(
    to: string,
    orgName: string,
    intentId: string,
    requiredCount: number
  ): Promise<void> {
    const text = this.templates.render("approval-required", {
      orgName,
      intentId,
      requiredCount: String(requiredCount),
      approvalUrl: `${this.webBaseUrl()}/approvals?intent=${intentId}`,
    });
    await this.email.send({
      to,
      subject: `Approval required — ${orgName}`,
      text,
    });
  }

  async sendApprovalReminder(
    to: string,
    orgName: string,
    intentId: string,
    pendingSince: string
  ): Promise<void> {
    const text = this.templates.render("approval-reminder", {
      orgName,
      intentId,
      pendingSince,
      approvalUrl: `${this.webBaseUrl()}/approvals?intent=${intentId}`,
    });
    await this.email.send({
      to,
      subject: `Reminder: pending approval — ${orgName}`,
      text,
    });
  }

  async notifyApproversForIntent(
    orgId: string,
    intentId: string,
    approverMemberIds: string[],
    requiredCount: number
  ): Promise<void> {
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    const orgName = org?.name ?? "your organization";
    const members = await this.prisma.member.findMany({
      where: { id: { in: approverMemberIds } },
      include: { user: true },
    });
    const emails = [...new Set(members.map((m) => m.user.email))];
    await Promise.all(
      emails.map((to) =>
        this.sendApprovalRequired(to, orgName, intentId, requiredCount)
      )
    );
  }
}

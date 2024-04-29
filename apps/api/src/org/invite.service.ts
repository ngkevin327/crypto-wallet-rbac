import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InviteStatus, MemberStatus, PlatformRole } from "@prisma/client";
import { createHash, randomBytes } from "crypto";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../database/prisma.service";
import { EmailPort } from "../notifications/email.port";

@Injectable()
export class InviteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailPort,
    private readonly audit: AuditService
  ) {}

  async createInvite(
    orgId: string,
    email: string,
    platformRole: PlatformRole,
    invitedByUserId: string
  ) {
    const inviter = await this.prisma.member.findFirst({
      where: {
        organizationId: orgId,
        userId: invitedByUserId,
        platformRole: PlatformRole.org_admin,
        status: MemberStatus.active,
      },
    });
    if (!inviter) {
      throw new ForbiddenException({ code: "NOT_ORG_ADMIN" });
    }

    const normalized = email.toLowerCase().trim();
    const pending = await this.prisma.invite.findFirst({
      where: { organizationId: orgId, email: normalized, status: InviteStatus.pending },
    });
    if (pending) {
      throw new ConflictException({ code: "INVITE_ALREADY_PENDING" });
    }

    const rawToken = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await this.prisma.invite.create({
      data: {
        organizationId: orgId,
        email: normalized,
        tokenHash,
        platformRole,
        invitedById: inviter.id,
        expiresAt,
      },
    });

    const webUrl = process.env.WEB_APP_URL ?? "http://localhost:3000";
    await this.email.send({
      to: normalized,
      subject: "You are invited to Wallet Team Permissions",
      text: `Accept your invite: ${webUrl}/invite?token=${rawToken}`,
    });

    await this.audit.appendMemberInvited(orgId, invitedByUserId, normalized, invite.id);

    return { inviteId: invite.id, expiresAt };
  }

  async acceptInvite(token: string, userId: string, userEmail: string) {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const invite = await this.prisma.invite.findFirst({
      where: { tokenHash, status: InviteStatus.pending },
    });
    if (!invite) {
      throw new NotFoundException({ code: "INVITE_NOT_FOUND" });
    }
    if (invite.expiresAt < new Date()) {
      await this.prisma.invite.update({
        where: { id: invite.id },
        data: { status: InviteStatus.expired },
      });
      throw new BadRequestException({ code: "INVITE_EXPIRED" });
    }
    if (invite.email !== userEmail.toLowerCase().trim()) {
      throw new ForbiddenException({ code: "INVITE_EMAIL_MISMATCH" });
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.member.create({
        data: {
          organizationId: invite.organizationId,
          userId,
          platformRole: invite.platformRole,
          status: MemberStatus.active,
        },
      });
      await tx.invite.update({
        where: { id: invite.id },
        data: { status: InviteStatus.accepted },
      });
    });

    return { organizationId: invite.organizationId };
  }
}

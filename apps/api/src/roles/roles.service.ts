import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { MemberStatus } from "@prisma/client";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../database/prisma.service";
@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async listRoles(orgId: string) {
    return this.prisma.role.findMany({
      where: { organizationId: orgId },
      orderBy: { name: "asc" },
    });
  }

  async assignRole(
    orgId: string,
    memberId: string,
    roleId: string,
    walletId: string | undefined,
    actorUserId: string
  ) {
    const member = await this.prisma.member.findFirst({
      where: {
        id: memberId,
        organizationId: orgId,
        status: MemberStatus.active,
      },
    });
    if (!member) {
      throw new NotFoundException({ code: "MEMBER_NOT_FOUND" });
    }

    const role = await this.prisma.role.findFirst({
      where: { id: roleId, organizationId: orgId },
    });
    if (!role) {
      throw new NotFoundException({ code: "ROLE_NOT_FOUND" });
    }

    if (walletId) {
      const wallet = await this.prisma.wallet.findFirst({
        where: { id: walletId, organizationId: orgId },
      });
      if (!wallet) {
        throw new NotFoundException({ code: "WALLET_NOT_FOUND" });
      }
    }

    const active = await this.prisma.roleAssignment.findFirst({
      where: {
        memberId,
        roleId,
        walletId: walletId ?? null,
        endsAt: null,
      },
    });
    if (active) {
      throw new ConflictException({ code: "ROLE_ALREADY_ASSIGNED" });
    }

    const assignment = await this.prisma.roleAssignment.create({
      data: { memberId, roleId, walletId: walletId ?? null },
      include: { role: true },
    });

    await this.audit.append({
      eventType: "role.assigned",
      organizationId: orgId,
      actorId: actorUserId,
      payload: {
        memberId,
        roleId,
        assignmentId: assignment.id,
        walletId: walletId ?? null,
      },
    });

    return assignment;
  }

  async revokeRole(
    orgId: string,
    memberId: string,
    assignmentId: string,
    actorUserId: string
  ) {
    const assignment = await this.prisma.roleAssignment.findFirst({
      where: {
        id: assignmentId,
        memberId,
        member: { organizationId: orgId },
        endsAt: null,
      },
      include: { role: true },
    });
    if (!assignment) {
      throw new NotFoundException({ code: "ASSIGNMENT_NOT_FOUND" });
    }

    const revoked = await this.prisma.roleAssignment.update({
      where: { id: assignmentId },
      data: { endsAt: new Date() },
      include: { role: true },
    });

    await this.audit.append({
      eventType: "role.revoked",
      organizationId: orgId,
      actorId: actorUserId,
      payload: {
        memberId,
        roleId: assignment.roleId,
        assignmentId,
      },
    });

    return revoked;
  }

  async listMemberAssignments(orgId: string, memberId: string) {
    return this.prisma.roleAssignment.findMany({
      where: {
        memberId,
        member: { organizationId: orgId },
        endsAt: null,
      },
      include: { role: true, wallet: true },
      orderBy: { createdAt: "desc" },
    });
  }

}

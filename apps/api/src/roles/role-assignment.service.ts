import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import { MemberStatus, RoleAssignmentStatus } from "@prisma/client";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../database/prisma.service";
import { SessionRepository } from "../auth/session.repository";
import { IntentService } from "../intent/intent.service";

export interface AssignRoleInput {
  roleId: string;
  walletId?: string;
  startsAt?: Date;
  endsAt?: Date;
}

@Injectable()
export class RoleAssignmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly sessions: SessionRepository,
    @Inject(forwardRef(() => IntentService))
    private readonly intents: IntentService
  ) {}

  async assign(
    orgId: string,
    memberId: string,
    input: AssignRoleInput,
    actorUserId: string
  ) {
    const member = await this.prisma.member.findFirst({
      where: {
        id: memberId,
        organizationId: orgId,
        status: MemberStatus.active,
      },
      include: { user: true },
    });
    if (!member) {
      throw new NotFoundException({ code: "MEMBER_NOT_FOUND" });
    }

    const role = await this.prisma.role.findFirst({
      where: { id: input.roleId, organizationId: orgId },
    });
    if (!role) {
      throw new NotFoundException({ code: "ROLE_NOT_FOUND" });
    }

    if (input.walletId) {
      const wallet = await this.prisma.wallet.findFirst({
        where: { id: input.walletId, organizationId: orgId },
      });
      if (!wallet) {
        throw new NotFoundException({ code: "WALLET_NOT_FOUND" });
      }
    }

    const startsAt = input.startsAt ?? new Date();
    const endsAt = input.endsAt ?? null;
    if (endsAt && endsAt <= startsAt) {
      throw new BadRequestException({
        code: "INVALID_ACCESS_WINDOW",
        message: "endsAt must be after startsAt",
      });
    }

    const overlapping = await this.prisma.roleAssignment.findFirst({
      where: {
        memberId,
        roleId: input.roleId,
        walletId: input.walletId ?? null,
        status: { in: [RoleAssignmentStatus.scheduled, RoleAssignmentStatus.active] },
      },
    });
    if (overlapping) {
      throw new ConflictException({ code: "ROLE_ALREADY_ASSIGNED" });
    }

    const now = new Date();
    const status =
      startsAt > now ? RoleAssignmentStatus.scheduled : RoleAssignmentStatus.active;

    const assignment = await this.prisma.roleAssignment.create({
      data: {
        memberId,
        roleId: input.roleId,
        walletId: input.walletId ?? null,
        startsAt,
        endsAt,
        status,
      },
      include: { role: true },
    });

    const isTemporary = !!endsAt;
    await this.audit.append({
      eventType: isTemporary ? "access.granted_temporary" : "role.assigned",
      organizationId: orgId,
      actorId: actorUserId,
      payload: {
        memberId,
        roleId: input.roleId,
        assignmentId: assignment.id,
        walletId: input.walletId ?? null,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt?.toISOString() ?? null,
      },
    });

    return assignment;
  }

  async revoke(
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
        status: { in: [RoleAssignmentStatus.scheduled, RoleAssignmentStatus.active] },
      },
      include: { role: true, member: true },
    });
    if (!assignment) {
      throw new NotFoundException({ code: "ASSIGNMENT_NOT_FOUND" });
    }

    const revoked = await this.prisma.roleAssignment.update({
      where: { id: assignmentId },
      data: {
        status: RoleAssignmentStatus.revoked,
        endsAt: new Date(),
      },
      include: { role: true },
    });

    await this.sessions.revokeByUser(assignment.member.userId);
    await this.intents.cancelByMember(memberId, "access_revoked");

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

  async promoteScheduled(): Promise<number> {
    const now = new Date();
    const result = await this.prisma.roleAssignment.updateMany({
      where: {
        status: RoleAssignmentStatus.scheduled,
        startsAt: { lte: now },
      },
      data: { status: RoleAssignmentStatus.active },
    });
    return result.count;
  }

  async expireActive(): Promise<number> {
    const now = new Date();
    const due = await this.prisma.roleAssignment.findMany({
      where: {
        status: RoleAssignmentStatus.active,
        endsAt: { lte: now },
      },
      include: { member: { select: { id: true, userId: true, organizationId: true } } },
    });

    for (const assignment of due) {
      await this.prisma.roleAssignment.update({
        where: { id: assignment.id },
        data: { status: RoleAssignmentStatus.expired },
      });
      await this.sessions.revokeByUser(assignment.member.userId);
      await this.intents.cancelByMember(assignment.memberId, "access_revoked");
      await this.audit.append({
        eventType: "access.expired",
        organizationId: assignment.member.organizationId,
        payload: {
          memberId: assignment.memberId,
          roleId: assignment.roleId,
          assignmentId: assignment.id,
          endsAt: assignment.endsAt?.toISOString(),
        },
      });
    }

    return due.length;
  }
}

import { Injectable } from "@nestjs/common";
import { MemberStatus, RoleAssignmentStatus } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class RoleAssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveForMember(memberId: string) {
    const now = new Date();
    return this.prisma.roleAssignment.findMany({
      where: {
        memberId,
        status: RoleAssignmentStatus.active,
        member: { status: MemberStatus.active },
        startsAt: { lte: now },
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      },
      include: { role: true },
    });
  }
}

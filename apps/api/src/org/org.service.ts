import { Injectable, NotFoundException } from "@nestjs/common";
import { MemberStatus, PlatformRole } from "@prisma/client";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../database/prisma.service";
import { PolicyTemplateSeedService } from "../roles/policy-template-seed.service";
import { RoleSeedService } from "../roles/role-seed.service";

@Injectable()
export class OrgService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly roleSeed: RoleSeedService,
    private readonly policySeed: PolicyTemplateSeedService
  ) {}

  async createOrganization(name: string, creatorUserId: string) {
    return this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({ data: { name } });
      await tx.member.create({
        data: {
          organizationId: org.id,
          userId: creatorUserId,
          platformRole: PlatformRole.org_admin,
          status: MemberStatus.active,
        },
      });
      await this.roleSeed.seedTemplatesForOrganization(org.id, tx);
      await this.policySeed.seedDefaultPoliciesForOrganization(org.id, tx);
      await this.audit.appendOrgCreated(org.id, creatorUserId, name);
      return org;
    });
  }

  async getOrganization(orgId: string, userId: string) {
    const member = await this.prisma.member.findFirst({
      where: { organizationId: orgId, userId, status: MemberStatus.active },
      include: { organization: true },
    });
    if (!member) {
      throw new NotFoundException({ code: "ORG_NOT_FOUND", message: "Organization not found" });
    }
    return member.organization;
  }

  async listForUser(userId: string) {
    return this.prisma.organization.findMany({
      where: { members: { some: { userId, status: MemberStatus.active } } },
      orderBy: { createdAt: "desc" },
    });
  }
}

import { Injectable } from "@nestjs/common";
import { MemberStatus, PolicyStatus } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

export interface OrgSetupStatus {
  hasWallet: boolean;
  hasTeamMember: boolean;
  hasPolicy: boolean;
  allComplete: boolean;
}

@Injectable()
export class SetupStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus(orgId: string): Promise<OrgSetupStatus> {
    const [walletCount, memberCount, policyCount] = await Promise.all([
      this.prisma.wallet.count({ where: { organizationId: orgId } }),
      this.prisma.member.count({
        where: { organizationId: orgId, status: MemberStatus.active },
      }),
      this.prisma.policy.count({
        where: { organizationId: orgId, status: PolicyStatus.active },
      }),
    ]);

    const hasWallet = walletCount > 0;
    const hasTeamMember = memberCount > 1;
    const hasPolicy = policyCount > 0;

    return {
      hasWallet,
      hasTeamMember,
      hasPolicy,
      allComplete: hasWallet && hasTeamMember && hasPolicy,
    };
  }
}

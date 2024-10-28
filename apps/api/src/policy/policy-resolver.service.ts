import { Injectable } from "@nestjs/common";
import { PolicyStatus } from "@prisma/client";
import type { PolicyRule } from "@wtp/shared/policy/rule-types";
import { PrismaService } from "../database/prisma.service";
import { RoleAssignmentRepository } from "../roles/role-assignment.repository";

@Injectable()
export class PolicyResolverService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assignments: RoleAssignmentRepository
  ) {}

  async getApplicablePolicies(memberId: string, walletId: string): Promise<PolicyRule[]> {
    const activeAssignments = await this.assignments.findActiveForMember(memberId);
    if (!activeAssignments.length) {
      return [];
    }

    const roleIds = activeAssignments.map((a) => a.roleId);
    const policies = await this.prisma.policy.findMany({
      where: {
        status: PolicyStatus.active,
        roleId: { in: roleIds },
        OR: [{ walletId: null }, { walletId }],
      },
    });

    const rules: PolicyRule[] = [];
    for (const policy of policies) {
      const parsed = policy.rules as unknown;
      if (Array.isArray(parsed)) {
        rules.push(...(parsed as PolicyRule[]));
      }
    }
    return rules;
  }

  async getApplicablePoliciesForOrg(
    orgId: string,
    memberId: string,
    walletId: string
  ): Promise<PolicyRule[]> {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, organizationId: orgId },
    });
    if (!member) {
      return [];
    }
    return this.getApplicablePolicies(memberId, walletId);
  }
}

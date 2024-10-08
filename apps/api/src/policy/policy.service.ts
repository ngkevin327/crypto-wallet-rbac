import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { MemberStatus, PlatformRole, PolicyStatus } from "@prisma/client";
import { INVALID_POLICY_RULE, parsePolicyRules } from "@wtp/shared/policy/policy.schema";
import type { PolicyRule } from "@wtp/shared/policy/rule-types";
import { PrismaService } from "../database/prisma.service";
import { PolicyRepository } from "./policy.repository";

@Injectable()
export class PolicyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly policies: PolicyRepository
  ) {}

  async createForRole(
    orgId: string,
    roleId: string,
    rulesInput: unknown,
    walletId?: string
  ) {
    await this.assertRoleInOrg(orgId, roleId);
    if (walletId) {
      await this.assertWalletInOrg(orgId, walletId);
    }

    const rules = this.parseRules(rulesInput);
    const existing = await this.policies.findActiveByScope(roleId, walletId ?? null);
    if (existing) {
      throw new ConflictException({
        code: "POLICY_ALREADY_EXISTS",
        message: "An active policy already exists for this role and wallet scope",
      });
    }

    return this.policies.createActive({
      organizationId: orgId,
      roleId,
      walletId: walletId ?? null,
      rules,
    });
  }

  async updatePolicy(orgId: string, policyId: string, rulesInput: unknown) {
    const current = await this.policies.findById(policyId);
    if (!current || current.organizationId !== orgId) {
      throw new NotFoundException({ code: "POLICY_NOT_FOUND" });
    }
    if (current.status !== PolicyStatus.active) {
      throw new ConflictException({ code: "POLICY_NOT_ACTIVE" });
    }

    const rules = this.parseRules(rulesInput);
    return this.policies.archiveAndCreateVersion(
      current.id,
      {
        organizationId: orgId,
        roleId: current.roleId,
        walletId: current.walletId,
        rules,
      },
      current.version + 1
    );
  }

  async listPolicies(
    orgId: string,
    filters: { roleId?: string; walletId?: string; includeArchived?: boolean }
  ) {
    return this.policies.listByOrganization(orgId, {
      roleId: filters.roleId,
      walletId: filters.walletId,
      status: filters.includeArchived ? undefined : PolicyStatus.active,
    });
  }

  async getById(orgId: string, policyId: string) {
    const policy = await this.policies.findById(policyId);
    if (!policy || policy.organizationId !== orgId) {
      throw new NotFoundException({ code: "POLICY_NOT_FOUND" });
    }
    return policy;
  }

  async updatePolicyAsAdmin(userId: string, policyId: string, rulesInput: unknown) {
    const policy = await this.policies.findById(policyId);
    if (!policy) {
      throw new NotFoundException({ code: "POLICY_NOT_FOUND" });
    }
    await this.assertOrgAdmin(policy.organizationId, userId);
    return this.updatePolicy(policy.organizationId, policyId, rulesInput);
  }

  async archivePolicyAsAdmin(userId: string, policyId: string) {
    const policy = await this.policies.findById(policyId);
    if (!policy) {
      throw new NotFoundException({ code: "POLICY_NOT_FOUND" });
    }
    await this.assertOrgAdmin(policy.organizationId, userId);
    return this.archivePolicy(policy.organizationId, policyId);
  }

  async archivePolicy(orgId: string, policyId: string) {
    const policy = await this.getById(orgId, policyId);
    if (policy.status === PolicyStatus.archived) {
      return policy;
    }
    return this.policies.archiveById(policyId);
  }

  private parseRules(input: unknown): PolicyRule[] {
    const parsed = parsePolicyRules(input);
    if (!parsed.success) {
      throw new BadRequestException({
        code: INVALID_POLICY_RULE,
        message: "Invalid policy rules",
        issues: parsed.issues,
      });
    }
    return parsed.rules;
  }

  private async assertRoleInOrg(orgId: string, roleId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, organizationId: orgId },
    });
    if (!role) {
      throw new NotFoundException({ code: "ROLE_NOT_FOUND" });
    }
  }

  private async assertOrgAdmin(orgId: string, userId: string) {
    const member = await this.prisma.member.findFirst({
      where: {
        organizationId: orgId,
        userId,
        status: MemberStatus.active,
        platformRole: PlatformRole.org_admin,
      },
    });
    if (!member) {
      throw new ForbiddenException({ code: "ORG_ADMIN_REQUIRED" });
    }
  }

  private async assertWalletInOrg(orgId: string, walletId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, organizationId: orgId },
    });
    if (!wallet) {
      throw new NotFoundException({ code: "WALLET_NOT_FOUND" });
    }
  }
}

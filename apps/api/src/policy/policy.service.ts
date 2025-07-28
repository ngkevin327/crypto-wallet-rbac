import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { MemberStatus, PlatformRole, PolicyStatus } from "@prisma/client";
import { parsePolicyRules } from "@wtp/shared/policy/policy.schema";
import { INVALID_POLICY_RULE } from "@wtp/shared/policy/reason-codes";
import type { PolicyRule } from "@wtp/shared/policy/rule-types";
import { createHash } from "crypto";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../database/prisma.service";
import { PolicyRepository } from "./policy.repository";

@Injectable()
export class PolicyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly policies: PolicyRepository,
    private readonly audit: AuditService
  ) {}

  async createForRole(
    orgId: string,
    roleId: string,
    rulesInput: unknown,
    actorUserId: string,
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

    const created = await this.policies.createActive({
      organizationId: orgId,
      roleId,
      walletId: walletId ?? null,
      rules,
    });
    await this.audit.append({
      eventType: "policy.created",
      organizationId: orgId,
      actorId: actorUserId,
      payload: {
        policyId: created.id,
        roleId,
        version: created.version,
        rulesHash: this.hashRules(rules),
      },
    });
    return created;
  }

  async updatePolicy(
    orgId: string,
    policyId: string,
    rulesInput: unknown,
    actorUserId?: string
  ) {
    const current = await this.policies.findById(policyId);
    if (!current || current.organizationId !== orgId) {
      throw new NotFoundException({ code: "POLICY_NOT_FOUND" });
    }
    if (current.status !== PolicyStatus.active) {
      throw new ConflictException({ code: "POLICY_NOT_ACTIVE" });
    }

    const rules = this.parseRules(rulesInput);
    const updated = await this.policies.archiveAndCreateVersion(
      current.id,
      {
        organizationId: orgId,
        roleId: current.roleId,
        walletId: current.walletId,
        rules,
      },
      current.version + 1
    );
    if (actorUserId) {
      await this.audit.append({
        eventType: "policy.updated",
        organizationId: orgId,
        actorId: actorUserId,
        payload: {
          policyId: updated.id,
          roleId: current.roleId,
          version: updated.version,
          rulesHash: this.hashRules(rules),
        },
      });
    }
    return updated;
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
    return this.updatePolicy(policy.organizationId, policyId, rulesInput, userId);
  }

  async archivePolicyAsAdmin(userId: string, policyId: string) {
    const policy = await this.policies.findById(policyId);
    if (!policy) {
      throw new NotFoundException({ code: "POLICY_NOT_FOUND" });
    }
    await this.assertOrgAdmin(policy.organizationId, userId);
    return this.archivePolicy(policy.organizationId, policyId, userId);
  }

  async archivePolicy(orgId: string, policyId: string, actorUserId?: string) {
    const policy = await this.getById(orgId, policyId);
    if (policy.status === PolicyStatus.archived) {
      return policy;
    }
    const archived = await this.policies.archiveById(policyId);
    if (actorUserId) {
      await this.audit.append({
        eventType: "policy.deleted",
        organizationId: orgId,
        actorId: actorUserId,
        payload: {
          policyId,
          roleId: policy.roleId,
          version: policy.version,
        },
      });
    }
    return archived;
  }

  private hashRules(rules: PolicyRule[]): string {
    return createHash("sha256").update(JSON.stringify(rules)).digest("hex");
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

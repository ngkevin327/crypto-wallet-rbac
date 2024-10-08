import { Injectable } from "@nestjs/common";
import { PolicyStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import type { PolicyRule } from "@wtp/shared/policy/rule-types";

export interface CreatePolicyRecordInput {
  organizationId: string;
  roleId: string;
  walletId?: string | null;
  rules: PolicyRule[];
}

@Injectable()
export class PolicyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveByScope(roleId: string, walletId: string | null) {
    return this.prisma.policy.findFirst({
      where: {
        roleId,
        walletId,
        status: PolicyStatus.active,
      },
    });
  }

  async createActive(input: CreatePolicyRecordInput) {
    return this.prisma.policy.create({
      data: {
        organizationId: input.organizationId,
        roleId: input.roleId,
        walletId: input.walletId ?? null,
        version: 1,
        status: PolicyStatus.active,
        rules: input.rules as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async archiveAndCreateVersion(
    existingId: string,
    input: CreatePolicyRecordInput,
    nextVersion: number
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.policy.update({
        where: { id: existingId },
        data: { status: PolicyStatus.archived },
      });
      return tx.policy.create({
        data: {
          organizationId: input.organizationId,
          roleId: input.roleId,
          walletId: input.walletId ?? null,
          version: nextVersion,
          status: PolicyStatus.active,
          rules: input.rules as unknown as Prisma.InputJsonValue,
        },
      });
    });
  }

  async findById(id: string) {
    return this.prisma.policy.findUnique({ where: { id } });
  }

  async listByOrganization(
    orgId: string,
    filters: { roleId?: string; walletId?: string; status?: PolicyStatus }
  ) {
    return this.prisma.policy.findMany({
      where: {
        organizationId: orgId,
        ...(filters.roleId ? { roleId: filters.roleId } : {}),
        ...(filters.walletId ? { walletId: filters.walletId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      orderBy: [{ roleId: "asc" }, { version: "desc" }],
    });
  }

  async archiveById(id: string) {
    return this.prisma.policy.update({
      where: { id },
      data: { status: PolicyStatus.archived },
    });
  }
}

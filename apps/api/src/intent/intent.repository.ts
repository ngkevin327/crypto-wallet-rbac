import { Injectable } from "@nestjs/common";
import { IntentStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

export interface CreateIntentRecord {
  organizationId: string;
  walletId: string;
  memberId: string;
  intentType?: "transfer" | "deploy";
  source?: "web" | "api";
  apiKeyId?: string | null;
  tokenAddress: string;
  chainId: number;
  amountNative: string;
  amountUsd: number | null;
  toAddress: string;
  calldata?: string | null;
  status: IntentStatus;
  policyVersionId?: string | null;
  policyDecisionJson: Prisma.InputJsonValue;
}

@Injectable()
export class IntentRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateIntentRecord) {
    return this.prisma.transactionIntent.create({ data });
  }

  findById(id: string) {
    return this.prisma.transactionIntent.findUnique({
      where: { id },
      include: {
        approvalRequests: { include: { decisions: true }, orderBy: { createdAt: "desc" } },
      },
    });
  }

  findByOrg(
    orgId: string,
    filters: { status?: IntentStatus; memberId?: string }
  ) {
    return this.prisma.transactionIntent.findMany({
      where: {
        organizationId: orgId,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.memberId ? { memberId: filters.memberId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { approvalRequests: true },
    });
  }

  updateStatus(
    id: string,
    status: IntentStatus,
    extra?: Partial<{
      safeTxHash: string;
      txHash: string;
      failureReason: string;
    }>
  ) {
    return this.prisma.transactionIntent.update({
      where: { id },
      data: { status, ...extra },
    });
  }
}

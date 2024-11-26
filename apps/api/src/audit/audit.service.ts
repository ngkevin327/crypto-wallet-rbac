import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import type { AppendAuditInput, AuditEventType } from "./audit-event.types";

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async append(input: AppendAuditInput): Promise<void> {
    const payload = this.sanitizePayload(input.payload ?? {});
    await this.prisma.auditEvent.create({
      data: {
        organizationId: input.organizationId ?? null,
        eventType: input.eventType,
        actorId: input.actorId ?? null,
        payload: payload as Prisma.InputJsonValue,
      },
    });
    this.logger.debug(
      `audit ${input.eventType} org=${input.organizationId ?? "-"} actor=${input.actorId ?? "-"}`
    );
  }

  async appendOrgCreated(orgId: string, actorId: string, name: string): Promise<void> {
    await this.append({
      eventType: "org.created",
      organizationId: orgId,
      actorId,
      payload: { name },
    });
  }

  async appendMemberInvited(
    orgId: string,
    actorId: string,
    email: string,
    inviteId: string
  ): Promise<void> {
    await this.append({
      eventType: "member.invited",
      organizationId: orgId,
      actorId,
      payload: { email, inviteId },
    });
  }

  async appendIntentCreated(
    orgId: string,
    actorId: string,
    payload: {
      intentId: string;
      amountUsd: number | null;
      tokenAddress: string;
      decision: string;
      reasons: string[];
    }
  ): Promise<void> {
    await this.append({
      eventType: "intent.created",
      organizationId: orgId,
      actorId,
      payload,
    });
  }

  async appendApprovalGranted(
    orgId: string,
    actorId: string,
    payload: { requestId: string; intentId: string; approvalCount: number }
  ): Promise<void> {
    await this.append({
      eventType: "approval.granted",
      organizationId: orgId,
      actorId,
      payload,
    });
  }

  async appendApprovalRejected(
    orgId: string,
    actorId: string,
    payload: { requestId: string; intentId: string; reason?: string }
  ): Promise<void> {
    await this.append({
      eventType: "approval.rejected",
      organizationId: orgId,
      actorId,
      payload,
    });
  }

  async appendIntentPolicyDenied(
    orgId: string,
    actorId: string,
    payload: {
      intentId: string;
      amountUsd: number | null;
      tokenAddress: string;
      reasons: string[];
    }
  ): Promise<void> {
    await this.append({
      eventType: "intent.policy_denied",
      organizationId: orgId,
      actorId,
      payload,
    });
  }

  async appendWalletConnected(
    orgId: string,
    actorId: string,
    walletId: string,
    address: string,
    chainId: number
  ): Promise<void> {
    await this.append({
      eventType: "wallet.connected",
      organizationId: orgId,
      actorId,
      payload: { walletId, address, chainId },
    });
  }

  private sanitizePayload(payload: Record<string, unknown>): Record<string, unknown> {
    const blocked = new Set(["password", "refreshToken", "mfaSecret", "signature"]);
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload)) {
      if (blocked.has(key)) {
        continue;
      }
      out[key] = value;
    }
    return out;
  }
}

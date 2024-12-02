import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { IntentStatus } from "@prisma/client";
import { transitionIntentStatus } from "@wtp/shared/intent/intent-state-machine";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../database/prisma.service";
import { classifySafeError } from "../wallet/safe/safe-error.classifier";
import { SafeTransactionServiceClient } from "../wallet/safe/safe-tx.client";
import { TxStatusQueue } from "../worker/tx-status.queue";
import { IntentRepository } from "./intent.repository";
import { SafePayloadBuilder } from "./safe-payload.builder";

@Injectable()
export class IntentExecutionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: IntentRepository,
    private readonly safeTx: SafeTransactionServiceClient,
    private readonly payloadBuilder: SafePayloadBuilder,
    private readonly audit: AuditService,
    private readonly txStatusQueue: TxStatusQueue
  ) {}

  async propose(intentId: string, senderAddress: string, signature = "0x") {
    const intent = await this.repository.findById(intentId);
    if (!intent) {
      throw new NotFoundException({ code: "INTENT_NOT_FOUND" });
    }
    if (intent.status !== IntentStatus.ready_to_sign) {
      throw new BadRequestException({
        code: "INTENT_NOT_READY",
        message: `Intent must be ready_to_sign, got ${intent.status}`,
      });
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { id: intent.walletId },
    });
    if (!wallet) {
      throw new NotFoundException({ code: "WALLET_NOT_FOUND" });
    }

    const txData = this.payloadBuilder.buildErc20Transfer({
      chainId: intent.chainId,
      tokenAddress: intent.tokenAddress,
      toAddress: intent.toAddress,
      amountNative: intent.amountNative,
    });

    try {
      const proposed = await this.safeTx.proposeTransaction({
        safeAddress: wallet.address,
        chainId: intent.chainId,
        sender: senderAddress,
        signature,
        txData,
      });

      const safeTxHash = proposed.safeTxHash;
      const submitted = transitionIntentStatus("ready_to_sign", "PROPOSED");
      await this.repository.updateStatus(intentId, submitted, { safeTxHash });

      await this.audit.append({
        eventType: "intent.submitted",
        organizationId: intent.organizationId,
        actorId: intent.memberId,
        payload: { intentId, safeTxHash },
      });

      await this.txStatusQueue.enqueue({
        intentId,
        safeTxHash,
        chainId: intent.chainId,
      });

      return this.repository.findById(intentId);
    } catch (err) {
      const classified = classifySafeError(err);
      if (!classified.retryable) {
        await this.repository.updateStatus(intentId, IntentStatus.failed, {
          failureReason: classified.failureReason,
        });
        await this.audit.append({
          eventType: "intent.failed",
          organizationId: intent.organizationId,
          payload: { intentId, failureReason: classified.failureReason },
        });
      }
      throw err;
    }
  }

}

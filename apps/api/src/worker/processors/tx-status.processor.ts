import { Injectable, Logger } from "@nestjs/common";
import { IntentStatus } from "@prisma/client";
import { transitionIntentStatus } from "@wtp/shared/intent/intent-state-machine";
import { AuditService } from "../../audit/audit.service";
import { IntentRepository } from "../../intent/intent.repository";
import { classifySafeError } from "../../wallet/safe/safe-error.classifier";
import { SafeTransactionServiceClient } from "../../wallet/safe/safe-tx.client";
import type { TxStatusJobPayload } from "../queues";

@Injectable()
export class TxStatusProcessor {
  private readonly logger = new Logger(TxStatusProcessor.name);

  constructor(
    private readonly safeTx: SafeTransactionServiceClient,
    private readonly intents: IntentRepository,
    private readonly audit: AuditService
  ) {}

  async handle(payload: TxStatusJobPayload, attempt = 1): Promise<void> {
    const maxAttempts = 60;
    const intent = await this.intents.findById(payload.intentId);
    if (!intent || intent.status !== IntentStatus.submitted) {
      return;
    }

    try {
      const status = await this.safeTx.getTransaction(payload.safeTxHash, payload.chainId);
      if (status.status === "EXECUTED" && status.txHash) {
        await this.intents.updateStatus(
          payload.intentId,
          transitionIntentStatus("submitted", "ONCHAIN_SUCCESS"),
          { txHash: status.txHash }
        );
        await this.audit.append({
          eventType: "intent.executed",
          organizationId: intent.organizationId,
          payload: {
            intentId: intent.id,
            safeTxHash: payload.safeTxHash,
            txHash: status.txHash,
            blockNumber: status.blockNumber ?? null,
          },
        });
        return;
      }
      if (status.status === "FAILED" || status.status === "CANCELLED") {
        await this.intents.updateStatus(
          payload.intentId,
          transitionIntentStatus("submitted", "ONCHAIN_FAILED"),
          { failureReason: `safe_status_${status.status.toLowerCase()}` }
        );
        await this.audit.append({
          eventType: "intent.failed",
          organizationId: intent.organizationId,
          payload: { intentId: intent.id, safeTxHash: payload.safeTxHash },
        });
        return;
      }
    } catch (err) {
      const classified = classifySafeError(err);
      if (!classified.retryable || attempt >= maxAttempts) {
        await this.intents.updateStatus(payload.intentId, IntentStatus.failed, {
          failureReason: classified.failureReason,
        });
        return;
      }
      this.logger.warn(`Tx status poll retry ${attempt} for ${payload.intentId}`);
      throw err;
    }

    if (attempt >= maxAttempts) {
      await this.intents.updateStatus(payload.intentId, IntentStatus.failed, {
        failureReason: "tx_status_poll_timeout",
      });
    }
  }
}

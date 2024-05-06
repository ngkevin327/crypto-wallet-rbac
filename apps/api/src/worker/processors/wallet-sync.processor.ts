import { Injectable, Logger } from "@nestjs/common";
import { WalletSyncService } from "../../wallet/wallet-sync.service";
import type { WalletSyncJobPayload } from "../queues";

@Injectable()
export class WalletSyncProcessor {
  private readonly logger = new Logger(WalletSyncProcessor.name);

  constructor(private readonly sync: WalletSyncService) {}

  /** Idempotent per wallet id — safe to retry on BullMQ failure. */
  async handle(payload: WalletSyncJobPayload): Promise<void> {
    if (payload.walletId) {
      try {
        await this.sync.syncWalletById(payload.walletId);
      } catch (err) {
        this.logger.error(
          `Wallet sync failed for ${payload.walletId}: ${err instanceof Error ? err.message : String(err)}`
        );
        throw err;
      }
      return;
    }

    if (payload.cron) {
      const ids = await this.sync.listStaleWalletIds(15);
      this.logger.log(`Cron wallet sync: ${ids.length} stale wallets`);
      for (const id of ids) {
        try {
          await this.sync.syncWalletById(id);
        } catch (err) {
          this.logger.error(
            `Cron sync failed for ${id}: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      }
    }
  }
}

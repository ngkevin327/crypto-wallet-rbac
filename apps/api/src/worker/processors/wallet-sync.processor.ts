import { Injectable, Logger } from "@nestjs/common";
import { WalletSyncService } from "../../wallet/wallet-sync.service";

export interface WalletSyncJobPayload {
  walletId?: string;
  cron?: boolean;
}

@Injectable()
export class WalletSyncProcessor {
  private readonly logger = new Logger(WalletSyncProcessor.name);

  constructor(private readonly sync: WalletSyncService) {}

  async handle(payload: WalletSyncJobPayload): Promise<void> {
    if (payload.walletId) {
      await this.sync.syncWalletById(payload.walletId);
      return;
    }

    if (payload.cron) {
      const ids = await this.sync.listStaleWalletIds(15);
      this.logger.log(`Cron wallet sync: ${ids.length} wallets queued`);
      for (const id of ids) {
        try {
          await this.sync.syncWalletById(id);
        } catch (err) {
          this.logger.error(`Cron sync failed for ${id}: ${String(err)}`);
        }
      }
    }
  }
}

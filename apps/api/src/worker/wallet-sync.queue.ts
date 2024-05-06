import { Inject, Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { Queue } from "bullmq";
import { BULLMQ_CONNECTION } from "./bullmq.module";
import {
  QUEUE_WALLET_SYNC,
  WALLET_SYNC_CRON,
  WALLET_SYNC_JOB,
  type WalletSyncJobPayload,
} from "./queues";

@Injectable()
export class WalletSyncQueue implements OnModuleDestroy {
  private readonly logger = new Logger(WalletSyncQueue.name);
  private readonly queue: Queue<WalletSyncJobPayload>;

  constructor(@Inject(BULLMQ_CONNECTION) connection: object) {
    this.queue = new Queue(QUEUE_WALLET_SYNC, { connection: connection as never });
  }

  async enqueueWalletSync(walletId: string): Promise<void> {
    const jobId = `wallet-sync:${walletId}`;
    await this.queue.add(
      WALLET_SYNC_JOB,
      { walletId },
      {
        jobId,
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
      }
    );
    this.logger.debug(`Enqueued wallet sync for ${walletId}`);
  }

  async enqueueCronSweep(): Promise<void> {
    await this.queue.add(
      WALLET_SYNC_CRON,
      { cron: true },
      {
        jobId: `wallet-sync-cron:${Math.floor(Date.now() / 900_000)}`,
        removeOnComplete: true,
        attempts: 2,
        backoff: { type: "exponential", delay: 5000 },
      }
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}

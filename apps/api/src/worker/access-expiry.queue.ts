import { Inject, Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { Queue } from "bullmq";
import { BULLMQ_CONNECTION } from "./bullmq.module";
import {
  ACCESS_EXPIRY_CRON,
  ACCESS_EXPIRY_JOB,
  QUEUE_ACCESS_EXPIRY,
  type AccessExpiryJobPayload,
} from "./queues";

@Injectable()
export class AccessExpiryQueue implements OnModuleDestroy {
  private readonly logger = new Logger(AccessExpiryQueue.name);
  private readonly queue: Queue<AccessExpiryJobPayload>;

  constructor(@Inject(BULLMQ_CONNECTION) connection: object) {
    this.queue = new Queue(QUEUE_ACCESS_EXPIRY, { connection: connection as never });
  }

  async enqueueCronSweep(): Promise<void> {
    await this.queue.add(
      ACCESS_EXPIRY_CRON,
      { cron: true },
      {
        jobId: `access-expiry-cron:${Math.floor(Date.now() / 60_000)}`,
        removeOnComplete: true,
        attempts: 2,
        repeat: { every: 60 * 1000 },
      }
    );
    this.logger.debug("Scheduled access expiry sweep");
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}

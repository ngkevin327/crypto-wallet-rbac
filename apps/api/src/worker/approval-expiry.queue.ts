import { Inject, Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { Queue } from "bullmq";
import { BULLMQ_CONNECTION } from "./bullmq.module";
import {
  APPROVAL_EXPIRY_CRON,
  APPROVAL_EXPIRY_JOB,
  QUEUE_APPROVAL_EXPIRY,
  type ApprovalExpiryJobPayload,
} from "./queues";

@Injectable()
export class ApprovalExpiryQueue implements OnModuleDestroy {
  private readonly logger = new Logger(ApprovalExpiryQueue.name);
  private readonly queue: Queue<ApprovalExpiryJobPayload>;

  constructor(@Inject(BULLMQ_CONNECTION) connection: object) {
    this.queue = new Queue(QUEUE_APPROVAL_EXPIRY, { connection: connection as never });
  }

  async enqueueCronSweep(): Promise<void> {
    await this.queue.add(
      APPROVAL_EXPIRY_CRON,
      { cron: true },
      {
        jobId: `approval-expiry-cron:${Math.floor(Date.now() / 900_000)}`,
        removeOnComplete: true,
        attempts: 2,
        repeat: { every: 15 * 60 * 1000 },
      }
    );
    this.logger.debug("Scheduled approval expiry sweep");
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}

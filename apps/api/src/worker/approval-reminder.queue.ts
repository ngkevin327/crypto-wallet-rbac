import { Inject, Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { Queue } from "bullmq";
import { BULLMQ_CONNECTION } from "./bullmq.module";
import {
  APPROVAL_REMINDER_CRON,
  APPROVAL_REMINDER_JOB,
  QUEUE_APPROVAL_REMINDER,
  type ApprovalReminderJobPayload,
} from "./queues";

@Injectable()
export class ApprovalReminderQueue implements OnModuleDestroy {
  private readonly logger = new Logger(ApprovalReminderQueue.name);
  private readonly queue: Queue<ApprovalReminderJobPayload>;

  constructor(@Inject(BULLMQ_CONNECTION) connection: object) {
    this.queue = new Queue(QUEUE_APPROVAL_REMINDER, { connection: connection as never });
  }

  async enqueueCronSweep(): Promise<void> {
    await this.queue.add(
      APPROVAL_REMINDER_CRON,
      { cron: true },
      {
        jobId: `approval-reminder-cron:${Math.floor(Date.now() / 3_600_000)}`,
        removeOnComplete: true,
        attempts: 2,
        repeat: { every: 60 * 60 * 1000 },
      }
    );
    this.logger.debug("Scheduled approval reminder sweep");
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}

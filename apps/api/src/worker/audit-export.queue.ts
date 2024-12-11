import { Inject, Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { Queue } from "bullmq";
import { BULLMQ_CONNECTION } from "./bullmq.module";
import {
  AUDIT_EXPORT_JOB,
  QUEUE_AUDIT_EXPORT,
  type AuditExportJobPayload,
} from "./queues";

@Injectable()
export class AuditExportQueue implements OnModuleDestroy {
  private readonly logger = new Logger(AuditExportQueue.name);
  private readonly queue: Queue<AuditExportJobPayload>;

  constructor(@Inject(BULLMQ_CONNECTION) connection: object) {
    this.queue = new Queue(QUEUE_AUDIT_EXPORT, { connection: connection as never });
  }

  async enqueue(jobId: string, orgId: string): Promise<void> {
    await this.queue.add(
      AUDIT_EXPORT_JOB,
      { jobId, orgId },
      {
        jobId: `audit-export:${jobId}`,
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: { type: "exponential", delay: 3000 },
      }
    );
    this.logger.debug(`Enqueued audit export ${jobId}`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}

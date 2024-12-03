import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import { Queue } from "bullmq";
import { BULLMQ_CONNECTION } from "./bullmq.module";
import { QUEUE_TX_STATUS, TX_STATUS_JOB, type TxStatusJobPayload } from "./queues";

@Injectable()
export class TxStatusQueue implements OnModuleDestroy {
  private readonly queue: Queue<TxStatusJobPayload>;

  constructor(@Inject(BULLMQ_CONNECTION) connection: object) {
    this.queue = new Queue(QUEUE_TX_STATUS, { connection: connection as never });
  }

  async enqueue(payload: TxStatusJobPayload): Promise<void> {
    await this.queue.add(TX_STATUS_JOB, payload, {
      jobId: `tx-status:${payload.intentId}`,
      attempts: 60,
      backoff: { type: "fixed", delay: 30_000 },
      removeOnComplete: 50,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}

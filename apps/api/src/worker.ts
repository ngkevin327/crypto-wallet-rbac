import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import { Worker } from "bullmq";
import { ConfigService } from "@nestjs/config";
import { BULLMQ_CONNECTION } from "./worker/bullmq.module";
import { WalletSyncProcessor } from "./worker/processors/wallet-sync.processor";
import { WorkerAppModule } from "./worker/worker-app.module";
import {
  QUEUE_WALLET_SYNC,
  WALLET_SYNC_CRON,
  WALLET_SYNC_JOB,
} from "./worker/queues";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkerAppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService);
  const connection = app.get(BULLMQ_CONNECTION);
  const processor = app.get(WalletSyncProcessor);
  const logger = app.get(Logger);

  const worker = new Worker(
    QUEUE_WALLET_SYNC,
    async (job) => {
      await processor.handle(job.data as { walletId?: string; cron?: boolean });
    },
    {
      connection,
      concurrency: 2,
    }
  );

  worker.on("failed", (job, err) => {
    logger.error(`Job ${job?.id} failed: ${err.message}`);
  });

  logger.log(`Worker listening on queue "${QUEUE_WALLET_SYNC}"`);

  const shutdown = async () => {
    await worker.close();
    await app.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

export { QUEUE_WALLET_SYNC, WALLET_SYNC_JOB, WALLET_SYNC_CRON };

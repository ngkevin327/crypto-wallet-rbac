import { Module } from "@nestjs/common";
import { AppConfigModule } from "../config/config.module";
import { DatabaseModule } from "../database/database.module";
import { AppLoggerModule } from "../logger/logger.module";
import { ApprovalModule } from "../approval/approval.module";
import { WalletModule } from "../wallet/wallet.module";
import { ApprovalExpiryQueue } from "./approval-expiry.queue";
import { BullMqModule } from "./bullmq.module";
import { ApprovalExpiryProcessor } from "./processors/approval-expiry.processor";
import { WalletSyncProcessor } from "./processors/wallet-sync.processor";

@Module({
  imports: [
    AppConfigModule,
    AppLoggerModule,
    DatabaseModule,
    BullMqModule,
    WalletModule,
    ApprovalModule,
  ],
  providers: [WalletSyncProcessor, ApprovalExpiryProcessor, ApprovalExpiryQueue],
})
export class WorkerAppModule {}

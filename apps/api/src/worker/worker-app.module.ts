import { Module } from "@nestjs/common";
import { AppConfigModule } from "../config/config.module";
import { DatabaseModule } from "../database/database.module";
import { AppLoggerModule } from "../logger/logger.module";
import { ApprovalModule } from "../approval/approval.module";
import { WalletModule } from "../wallet/wallet.module";
import { IntentModule } from "../intent/intent.module";
import { ApprovalExpiryQueue } from "./approval-expiry.queue";
import { BullMqModule } from "./bullmq.module";
import { ApprovalExpiryProcessor } from "./processors/approval-expiry.processor";
import { TxStatusProcessor } from "./processors/tx-status.processor";
import { WalletSyncProcessor } from "./processors/wallet-sync.processor";
import { TxStatusQueue } from "./tx-status.queue";

@Module({
  imports: [
    AppConfigModule,
    AppLoggerModule,
    DatabaseModule,
    BullMqModule,
    WalletModule,
    ApprovalModule,
    IntentModule,
  ],
  providers: [
    WalletSyncProcessor,
    ApprovalExpiryProcessor,
    ApprovalExpiryQueue,
    TxStatusProcessor,
    TxStatusQueue,
  ],
})
export class WorkerAppModule {}

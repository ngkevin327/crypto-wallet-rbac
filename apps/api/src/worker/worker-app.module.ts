import { Module } from "@nestjs/common";
import { AppConfigModule } from "../config/config.module";
import { DatabaseModule } from "../database/database.module";
import { AppLoggerModule } from "../logger/logger.module";
import { WalletModule } from "../wallet/wallet.module";
import { BullMqModule } from "./bullmq.module";
import { WalletSyncProcessor } from "./processors/wallet-sync.processor";

@Module({
  imports: [AppConfigModule, AppLoggerModule, DatabaseModule, BullMqModule, WalletModule],
  providers: [WalletSyncProcessor],
})
export class WorkerAppModule {}

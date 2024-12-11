import { Module } from "@nestjs/common";
import { AppConfigModule } from "../config/config.module";
import { DatabaseModule } from "../database/database.module";
import { AppLoggerModule } from "../logger/logger.module";
import { AuditModule } from "../audit/audit.module";
import { ApprovalModule } from "../approval/approval.module";
import { IntegrationModule } from "../integration/integration.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { RolesModule } from "../roles/roles.module";
import { WalletModule } from "../wallet/wallet.module";
import { IntentModule } from "../intent/intent.module";
import { AccessExpiryQueue } from "./access-expiry.queue";
import { ApprovalExpiryQueue } from "./approval-expiry.queue";
import { ApprovalReminderQueue } from "./approval-reminder.queue";
import { AuditExportQueue } from "./audit-export.queue";
import { BullMqModule } from "./bullmq.module";
import { AccessExpiryProcessor } from "./processors/access-expiry.processor";
import { ApprovalExpiryProcessor } from "./processors/approval-expiry.processor";
import { ApprovalReminderProcessor } from "./processors/approval-reminder.processor";
import { AuditExportProcessor } from "./processors/audit-export.processor";
import { TxStatusProcessor } from "./processors/tx-status.processor";
import { WalletSyncProcessor } from "./processors/wallet-sync.processor";
import { TxStatusQueue } from "./tx-status.queue";

@Module({
  imports: [
    AppConfigModule,
    AppLoggerModule,
    DatabaseModule,
    BullMqModule,
    IntegrationModule,
    NotificationsModule,
    AuditModule,
    RolesModule,
    WalletModule,
    ApprovalModule,
    IntentModule,
  ],
  providers: [
    WalletSyncProcessor,
    ApprovalExpiryProcessor,
    ApprovalExpiryQueue,
    AccessExpiryProcessor,
    AccessExpiryQueue,
    ApprovalReminderProcessor,
    ApprovalReminderQueue,
    AuditExportProcessor,
    AuditExportQueue,
    TxStatusProcessor,
    TxStatusQueue,
  ],
})
export class WorkerAppModule {}

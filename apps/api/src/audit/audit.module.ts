import { Global, Module } from "@nestjs/common";
import { IntegrationModule } from "../integration/integration.module";
import { AuditExportQueue } from "../worker/audit-export.queue";
import { BullMqModule } from "../worker/bullmq.module";
import { AuditExportController } from "./audit-export.controller";
import { AuditExportService } from "./audit-export.service";
import { AuditController } from "./audit.controller";
import { AuditQueryService } from "./audit-query.service";
import { AuditService } from "./audit.service";

@Global()
@Module({
  imports: [BullMqModule, IntegrationModule],
  controllers: [AuditController, AuditExportController],
  providers: [
    AuditService,
    AuditQueryService,
    AuditExportService,
    AuditExportQueue,
  ],
  exports: [AuditService, AuditQueryService, AuditExportService, AuditExportQueue],
})
export class AuditModule {}

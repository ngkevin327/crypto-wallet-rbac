import { Injectable, Logger } from "@nestjs/common";
import { AuditExportJobStatus } from "@prisma/client";
import { AuditExportService } from "../../audit/audit-export.service";
import { AuditQueryService } from "../../audit/audit-query.service";
import { createAuditCsvStream } from "../../audit/csv-stream.writer";
import { PrismaService } from "../../database/prisma.service";
import { S3Adapter } from "../../integration/s3.adapter";
import type { AuditExportJobPayload } from "../queues";

@Injectable()
export class AuditExportProcessor {
  private readonly logger = new Logger(AuditExportProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly query: AuditQueryService,
    private readonly exports: AuditExportService,
    private readonly s3: S3Adapter
  ) {}

  async handle(payload: AuditExportJobPayload): Promise<void> {
    const job = await this.exports.getExportJob(payload.jobId, payload.orgId);
    if (job.status === AuditExportJobStatus.completed) {
      return;
    }

    await this.prisma.auditExportJob.update({
      where: { id: job.id },
      data: { status: AuditExportJobStatus.processing },
    });

    try {
      const rows = await this.query.streamForExport(
        job.organizationId,
        job.fromDate,
        job.toDate
      );
      const stream = createAuditCsvStream(rows);
      const s3Key = this.s3.buildAuditExportKey(job.organizationId, job.id);
      await this.s3.uploadStream(s3Key, stream);

      const rowCount = await this.query.countInRange(
        job.organizationId,
        job.fromDate,
        job.toDate
      );

      await this.prisma.auditExportJob.update({
        where: { id: job.id },
        data: {
          status: AuditExportJobStatus.completed,
          s3Key,
          rowCount,
          completedAt: new Date(),
        },
      });
      this.logger.log(`Audit export ${job.id} completed (${rowCount} rows)`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await this.prisma.auditExportJob.update({
        where: { id: job.id },
        data: {
          status: AuditExportJobStatus.failed,
          errorMessage: message,
          completedAt: new Date(),
        },
      });
      this.logger.error(`Audit export ${job.id} failed: ${message}`);
      throw err;
    }
  }
}

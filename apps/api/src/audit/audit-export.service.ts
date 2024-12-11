import {
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
} from "@nestjs/common";
import { AuditExportJobStatus } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { AuditQueryService } from "./audit-query.service";
import { createAuditCsvStream } from "./csv-stream.writer";

export const SYNC_EXPORT_ROW_LIMIT = 5000;

@Injectable()
export class AuditExportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly query: AuditQueryService
  ) {}

  async exportCsvSync(orgId: string, from: Date, to: Date) {
    const count = await this.query.countInRange(orgId, from, to);
    if (count > SYNC_EXPORT_ROW_LIMIT) {
      throw new PayloadTooLargeException({
        code: "EXPORT_TOO_LARGE",
        message: `Export has ${count} rows; use POST /v1/orgs/:orgId/audit/export for async export`,
        rowCount: count,
      });
    }

    const stream = createAuditCsvStream(await this.query.streamForExport(orgId, from, to));
    return { stream, rowCount: count };
  }

  async createAsyncExportJob(orgId: string, from: Date, to: Date) {
    return this.prisma.auditExportJob.create({
      data: {
        organizationId: orgId,
        fromDate: from,
        toDate: to,
        status: AuditExportJobStatus.pending,
      },
    });
  }

  async getExportJob(jobId: string, orgId?: string) {
    const job = await this.prisma.auditExportJob.findFirst({
      where: {
        id: jobId,
        ...(orgId ? { organizationId: orgId } : {}),
      },
    });
    if (!job) {
      throw new NotFoundException({ code: "EXPORT_JOB_NOT_FOUND" });
    }
    return job;
  }
}

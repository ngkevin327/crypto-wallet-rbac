import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from "@nestjs/swagger";
import { IsDateString } from "class-validator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OrgMemberGuard } from "../common/guards/org-member.guard";
import { S3Adapter } from "../integration/s3.adapter";
import { AuditExportQueue } from "../worker/audit-export.queue";
import { AuditExportService } from "./audit-export.service";

class CreateAuditExportDto {
  @ApiProperty()
  @IsDateString()
  from!: string;

  @ApiProperty()
  @IsDateString()
  to!: string;
}

@ApiTags("audit")
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class AuditExportController {
  constructor(
    private readonly exports: AuditExportService,
    private readonly queue: AuditExportQueue,
    private readonly s3: S3Adapter
  ) {}

  @Post("orgs/:orgId/audit/export")
  @HttpCode(201)
  @UseGuards(OrgMemberGuard)
  @ApiOperation({ summary: "Enqueue async audit CSV export" })
  async createJob(
    @Param("orgId") orgId: string,
    @Body() body: CreateAuditExportDto
  ) {
    const job = await this.exports.createAsyncExportJob(
      orgId,
      new Date(body.from),
      new Date(body.to)
    );
    await this.queue.enqueue(job.id, orgId);
    return { jobId: job.id, status: job.status };
  }

  @Get("audit/export-jobs/:id")
  @ApiOperation({ summary: "Get export job status and download URL when ready" })
  async getJob(@Param("id") id: string) {
    const job = await this.exports.getExportJob(id);
    const downloadUrl =
      job.status === "completed" && job.s3Key
        ? await this.s3.getPresignedDownloadUrl(job.s3Key)
        : null;
    return {
      id: job.id,
      organizationId: job.organizationId,
      status: job.status,
      rowCount: job.rowCount,
      errorMessage: job.errorMessage,
      downloadUrl,
      completedAt: job.completedAt?.toISOString() ?? null,
    };
  }
}

import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from "@nestjs/swagger";
import { IsDateString } from "class-validator";
import type { Response } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OrgMemberGuard } from "../common/guards/org-member.guard";
import { AuditExportService } from "./audit-export.service";
import { AuditQueryService } from "./audit-query.service";
import { AuditQueryDto } from "./dto/audit-query.dto";
import { AuditEventsPageDto } from "./dto/audit-event-response.dto";

class AuditExportQueryDto {
  @ApiProperty()
  @IsDateString()
  from!: string;

  @ApiProperty()
  @IsDateString()
  to!: string;
}

@ApiTags("audit")
@ApiBearerAuth()
@Controller("orgs/:orgId/audit")
@UseGuards(JwtAuthGuard, OrgMemberGuard)
export class AuditController {
  constructor(
    private readonly query: AuditQueryService,
    private readonly exportService: AuditExportService
  ) {}

  @Get("events")
  @ApiOperation({ summary: "Paginated audit events with filters" })
  async listEvents(
    @Param("orgId") orgId: string,
    @Query() query: AuditQueryDto
  ): Promise<AuditEventsPageDto> {
    const { items, nextCursor } = await this.query.query(orgId, query);
    return {
      items: items.map((row) => ({
        id: row.id,
        eventType: row.eventType,
        actorId: row.actorId,
        payload: row.payload,
        partitionKey: row.partitionKey,
        createdAt: row.createdAt.toISOString(),
      })),
      nextCursor,
    };
  }

  @Get("export.csv")
  @ApiOperation({ summary: "Synchronous CSV export (max 5000 rows)" })
  async exportCsv(
    @Param("orgId") orgId: string,
    @Query() query: AuditExportQueryDto,
    @Res() res: Response
  ): Promise<void> {
    const fromDate = new Date(query.from);
    const toDate = new Date(query.to);
    const { stream, rowCount } = await this.exportService.exportCsvSync(
      orgId,
      fromDate,
      toDate
    );
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="audit-${orgId.slice(0, 8)}.csv"`
    );
    res.setHeader("X-Row-Count", String(rowCount));
    stream.pipe(res);
  }
}

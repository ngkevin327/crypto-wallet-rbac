import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { ApprovalRequestStatus, IntentStatus, MemberStatus } from "@prisma/client";
import { CurrentUser, type RequestUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OrgMemberGuard } from "../common/guards/org-member.guard";
import { PrismaService } from "../database/prisma.service";
import type { ApprovalRequestResponseDto } from "./dto/approval-request-response.dto";
import { DecideApprovalDto } from "./dto/decide-approval.dto";
import { ApprovalService } from "./approval.service";

@ApiTags("approvals")
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class ApprovalController {
  constructor(
    private readonly approvals: ApprovalService,
    private readonly prisma: PrismaService
  ) {}

  @Post("approvals/:requestId/decide")
  @ApiOperation({ summary: "Record an approval or rejection decision" })
  async decide(
    @Param("requestId") requestId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: DecideApprovalDto
  ) {
    const request = await this.approvals.getRequestById(requestId);
    const member = await this.prisma.member.findFirst({
      where: {
        userId: user.userId,
        organizationId: request.intent.organizationId,
        status: MemberStatus.active,
      },
    });
    if (!member) {
      throw new ForbiddenException({ code: "ORG_ACCESS_DENIED" });
    }

    const updated = await this.approvals.recordDecision(
      requestId,
      member.id,
      dto.decision,
      dto.note
    );
    return this.toResponse(updated);
  }

  @Get("orgs/:orgId/approvals")
  @UseGuards(OrgMemberGuard)
  @ApiOperation({ summary: "List pending approval requests for inbox" })
  @ApiQuery({ name: "status", required: false, enum: ApprovalRequestStatus })
  async list(
    @Param("orgId") orgId: string,
    @Query("status") status?: ApprovalRequestStatus
  ) {
    if (status && status !== ApprovalRequestStatus.pending) {
      return [];
    }
    const requests = await this.approvals.listPending(orgId);
    return requests.map((r) => this.toResponse(r));
  }

  private toResponse(
    request: {
      id: string;
      intentId: string;
      status: ApprovalRequestStatus;
      requiredCount: number;
      approverRoleIds: string[];
      expiresAt: Date;
      intent?: { status: IntentStatus };
      decisions?: { id: string; memberId: string; decision: string; decidedAt: Date }[];
    } | null
  ): ApprovalRequestResponseDto | null {
    if (!request) {
      return null;
    }
    return {
      id: request.id,
      intentId: request.intentId,
      status: request.status,
      requiredCount: request.requiredCount,
      approverRoleIds: request.approverRoleIds,
      expiresAt: request.expiresAt,
      intentStatus: request.intent?.status,
      decisions: request.decisions?.map((d) => ({
        id: d.id,
        memberId: d.memberId,
        decision: d.decision,
        decidedAt: d.decidedAt,
      })),
    };
  }
}

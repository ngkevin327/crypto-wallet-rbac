import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { IntentStatus } from "@prisma/client";
import { CurrentUser, type RequestUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OrgMemberGuard } from "../common/guards/org-member.guard";
import { CreateIntentDto } from "./dto/create-intent.dto";
import { toIntentResponse } from "./intent.mapper";
import { IntentService } from "./intent.service";

@ApiTags("intents")
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class IntentController {
  constructor(private readonly intents: IntentService) {}

  @Post("orgs/:orgId/intents")
  @UseGuards(OrgMemberGuard)
  @ApiOperation({ summary: "Create a transfer intent" })
  async create(
    @Param("orgId") orgId: string,
    @Req() req: { memberId: string },
    @Body() dto: CreateIntentDto
  ) {
    const { intent } = await this.intents.create(orgId, req.memberId, dto);
    return toIntentResponse(intent);
  }

  @Get("intents/:id")
  @ApiOperation({ summary: "Get intent detail with approval status" })
  async getOne(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    const intent = await this.intents.getById(id, user.userId);
    return toIntentResponse(intent);
  }

  @Get("orgs/:orgId/intents")
  @UseGuards(OrgMemberGuard)
  @ApiOperation({ summary: "List intents for an organization" })
  @ApiQuery({ name: "status", required: false, enum: IntentStatus })
  @ApiQuery({ name: "memberId", required: false })
  async list(
    @Param("orgId") orgId: string,
    @Query("status") status?: IntentStatus,
    @Query("memberId") memberId?: string
  ) {
    const intents = await this.intents.listByOrg(orgId, { status, memberId });
    return intents.map(toIntentResponse);
  }
}

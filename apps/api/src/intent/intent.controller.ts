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
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiQuery, ApiTags } from "@nestjs/swagger";
import { IntentStatus } from "@prisma/client";
import { IsOptional, IsString, Matches } from "class-validator";
import { CurrentUser, type RequestUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OrgMemberGuard } from "../common/guards/org-member.guard";
import { CreateIntentDto } from "./dto/create-intent.dto";
import { toIntentResponse } from "./intent.mapper";
import { IntentExecutionService } from "./intent-execution.service";
import { IntentService } from "./intent.service";

class ProposeIntentDto {
  @ApiProperty()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  senderAddress!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  signature?: string;
}

@ApiTags("intents")
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class IntentController {
  constructor(
    private readonly intents: IntentService,
    private readonly execution: IntentExecutionService
  ) {}

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

  @Post("intents/:id/propose")
  @ApiOperation({ summary: "Propose Safe transaction for a ready intent" })
  async propose(
    @Param("id") id: string,
    @Body() body: ProposeIntentDto,
    @CurrentUser() user: RequestUser
  ) {
    await this.intents.getById(id, user.userId);
    const intent = await this.execution.propose(
      id,
      body.senderAddress,
      body.signature ?? "0x"
    );
    return toIntentResponse(intent!);
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

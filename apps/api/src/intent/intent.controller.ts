import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
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
}

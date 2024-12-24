import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser, type RequestUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OrgMemberGuard } from "../common/guards/org-member.guard";
import { ApiKeysService } from "./api-keys.service";
import { CreateApiKeyDto } from "./dto/create-api-key.dto";

@ApiTags("api-keys")
@ApiBearerAuth()
@Controller("orgs/:orgId/api-keys")
@UseGuards(JwtAuthGuard, OrgMemberGuard)
export class ApiKeysController {
  constructor(private readonly apiKeys: ApiKeysService) {}

  @Post()
  @ApiOperation({ summary: "Create API key (secret returned once)" })
  create(
    @Param("orgId") orgId: string,
    @Body() dto: CreateApiKeyDto,
    @CurrentUser() user: RequestUser
  ) {
    return this.apiKeys.create(orgId, dto.name, dto.roleId, user.userId);
  }

  @Get()
  @ApiOperation({ summary: "List API keys (prefix only)" })
  list(@Param("orgId") orgId: string) {
    return this.apiKeys.list(orgId);
  }

  @Delete(":keyId")
  @ApiOperation({ summary: "Revoke an API key" })
  revoke(
    @Param("orgId") orgId: string,
    @Param("keyId") keyId: string,
    @CurrentUser() user: RequestUser
  ) {
    return this.apiKeys.revoke(orgId, keyId, user.userId);
  }
}

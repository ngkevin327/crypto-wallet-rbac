import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, type RequestUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateOrgDto } from "./dto/create-org.dto";
import { OrgService } from "./org.service";
import { SetupStatusService } from "./setup-status.service";

@Controller("orgs")
@UseGuards(JwtAuthGuard)
export class OrgController {
  constructor(
    private readonly orgs: OrgService,
    private readonly setup: SetupStatusService
  ) {}

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateOrgDto) {
    return this.orgs.createOrganization(dto.name, user.userId);
  }

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.orgs.listForUser(user.userId);
  }

  @Get(":orgId")
  getOne(@CurrentUser() user: RequestUser, @Param("orgId") orgId: string) {
    return this.orgs.getOrganization(orgId, user.userId);
  }

  @Get(":orgId/setup-status")
  async setupStatus(@CurrentUser() user: RequestUser, @Param("orgId") orgId: string) {
    await this.orgs.getOrganization(orgId, user.userId);
    return this.setup.getStatus(orgId);
  }
}

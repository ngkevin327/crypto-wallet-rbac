import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CurrentUser, type RequestUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OrgMemberGuard } from "../common/guards/org-member.guard";
import { OrgAdminGuard } from "../guards/org-admin.guard";
import { CreatePolicyDto } from "./dto/create-policy.dto";
import { UpdatePolicyDto } from "./dto/update-policy.dto";
import { PolicyService } from "./policy.service";

@ApiTags("policies")
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class PolicyController {
  constructor(private readonly policies: PolicyService) {}

  @Post("orgs/:orgId/roles/:roleId/policies")
  @UseGuards(OrgMemberGuard, OrgAdminGuard)
  @ApiOperation({ summary: "Create policy for a role (org admin)" })
  createForRole(
    @Param("orgId") orgId: string,
    @Param("roleId") roleId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreatePolicyDto
  ) {
    return this.policies.createForRole(orgId, roleId, dto.rules, user.userId, dto.walletId);
  }

  @Get("orgs/:orgId/policies")
  @UseGuards(OrgMemberGuard)
  @ApiOperation({ summary: "List policies for an organization" })
  @ApiQuery({ name: "roleId", required: false })
  @ApiQuery({ name: "walletId", required: false })
  @ApiQuery({ name: "includeArchived", required: false, type: Boolean })
  list(
    @Param("orgId") orgId: string,
    @Query("roleId") roleId?: string,
    @Query("walletId") walletId?: string,
    @Query("includeArchived") includeArchived?: string
  ) {
    return this.policies.listPolicies(orgId, {
      roleId,
      walletId,
      includeArchived: includeArchived === "true",
    });
  }

  @Get("orgs/:orgId/policies/:policyId")
  @UseGuards(OrgMemberGuard)
  getOne(@Param("orgId") orgId: string, @Param("policyId") policyId: string) {
    return this.policies.getById(orgId, policyId);
  }

  @Patch("policies/:policyId")
  @ApiOperation({ summary: "Update policy rules (creates new version, org admin)" })
  update(
    @Param("policyId") policyId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdatePolicyDto
  ) {
    return this.policies.updatePolicyAsAdmin(user.userId, policyId, dto.rules);
  }

  @Delete("policies/:policyId")
  @ApiOperation({ summary: "Archive a policy (org admin)" })
  archive(@Param("policyId") policyId: string, @CurrentUser() user: RequestUser) {
    return this.policies.archivePolicyAsAdmin(user.userId, policyId);
  }
}

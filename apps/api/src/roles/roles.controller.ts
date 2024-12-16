import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser, type RequestUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OrgMemberGuard } from "../common/guards/org-member.guard";
import { AssignRoleDto } from "./dto/assign-role.dto";
import { RoleAssignmentService } from "./role-assignment.service";
import { RolesService } from "./roles.service";

@ApiTags("roles")
@ApiBearerAuth()
@Controller("orgs/:orgId")
@UseGuards(JwtAuthGuard, OrgMemberGuard)
export class RolesController {
  constructor(
    private readonly roles: RolesService,
    private readonly assignments: RoleAssignmentService
  ) {}

  @Get("roles")
  @ApiOperation({ summary: "List role templates for an organization" })
  listRoles(@Param("orgId") orgId: string) {
    return this.roles.listRoles(orgId);
  }

  @Get("members/:memberId/roles")
  @ApiOperation({ summary: "List active role assignments for a member" })
  listMemberRoles(@Param("orgId") orgId: string, @Param("memberId") memberId: string) {
    return this.roles.listMemberAssignments(orgId, memberId);
  }

  @Post("members/:memberId/roles")
  @ApiOperation({ summary: "Assign a role template to a member" })
  assign(
    @Param("orgId") orgId: string,
    @Param("memberId") memberId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: AssignRoleDto
  ) {
    return this.assignments.assign(
      orgId,
      memberId,
      {
        roleId: dto.roleId,
        walletId: dto.walletId,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      },
      user.userId
    );
  }

  @Delete("members/:memberId/roles/:assignmentId")
  @ApiOperation({ summary: "Revoke an active role assignment" })
  revoke(
    @Param("orgId") orgId: string,
    @Param("memberId") memberId: string,
    @Param("assignmentId") assignmentId: string,
    @CurrentUser() user: RequestUser
  ) {
    return this.assignments.revoke(orgId, memberId, assignmentId, user.userId);
  }
}

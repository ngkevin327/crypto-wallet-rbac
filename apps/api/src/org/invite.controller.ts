import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { PlatformRole } from "@prisma/client";
import { IsEmail, IsEnum, IsOptional } from "class-validator";
import { CurrentUser, type RequestUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OrgMemberGuard } from "../common/guards/org-member.guard";
import { InviteService } from "./invite.service";
import { PrismaService } from "../database/prisma.service";
import { MemberStatus } from "@prisma/client";

class CreateInviteDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsEnum(PlatformRole)
  platformRole?: PlatformRole;
}

class AcceptInviteDto {
  token!: string;
}

@Controller()
@UseGuards(JwtAuthGuard)
export class InviteController {
  constructor(
    private readonly invites: InviteService,
    private readonly prisma: PrismaService
  ) {}

  @Post("orgs/:orgId/invites")
  @UseGuards(OrgMemberGuard)
  create(
    @CurrentUser() user: RequestUser,
    @Param("orgId") orgId: string,
    @Body() dto: CreateInviteDto
  ) {
    return this.invites.createInvite(
      orgId,
      dto.email,
      dto.platformRole ?? PlatformRole.org_member,
      user.userId
    );
  }

  @Post("invites/accept")
  accept(@CurrentUser() user: RequestUser, @Body() dto: AcceptInviteDto) {
    return this.invites.acceptInvite(dto.token, user.userId, user.email);
  }

  @Get("orgs/:orgId/members")
  @UseGuards(OrgMemberGuard)
  listMembers(@Param("orgId") orgId: string) {
    return this.prisma.member.findMany({
      where: { organizationId: orgId },
      include: { user: { select: { id: true, email: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  @Patch("orgs/:orgId/members/:memberId/deactivate")
  @UseGuards(OrgMemberGuard)
  async deactivate(@Param("orgId") orgId: string, @Param("memberId") memberId: string) {
    await this.prisma.member.updateMany({
      where: { id: memberId, organizationId: orgId },
      data: { status: MemberStatus.deactivated },
    });
    return { status: "deactivated" };
  }
}

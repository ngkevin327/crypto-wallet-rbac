import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { MemberStatus, PlatformRole } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class OrgAdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: { userId: string };
      params?: { orgId?: string };
      orgId?: string;
    }>();
    const userId = request.user?.userId;
    const orgId = request.params?.orgId ?? request.orgId;
    if (!userId || !orgId) {
      throw new ForbiddenException({ code: "ORG_ADMIN_REQUIRED" });
    }

    const member = await this.prisma.member.findFirst({
      where: { organizationId: orgId, userId, status: MemberStatus.active },
    });
    if (!member || member.platformRole !== PlatformRole.org_admin) {
      throw new ForbiddenException({ code: "ORG_ADMIN_REQUIRED" });
    }

    (request as { memberId: string }).memberId = member.id;
    return true;
  }
}

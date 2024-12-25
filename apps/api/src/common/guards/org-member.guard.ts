import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { MemberStatus } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class OrgMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: { userId: string };
      params?: { orgId?: string };
      orgId?: string;
      apiKeyContext?: { orgId: string; memberId: string };
      memberId?: string;
    }>();
    const orgId = request.params?.orgId ?? request.orgId;
    if (!orgId) {
      throw new ForbiddenException({ code: "ORG_ACCESS_DENIED" });
    }

    if (request.apiKeyContext) {
      if (request.apiKeyContext.orgId !== orgId) {
        throw new ForbiddenException({ code: "ORG_ACCESS_DENIED" });
      }
      request.memberId = request.apiKeyContext.memberId;
      return true;
    }

    const userId = request.user?.userId;
    if (!userId) {
      throw new ForbiddenException({ code: "ORG_ACCESS_DENIED" });
    }
    const member = await this.prisma.member.findFirst({
      where: { organizationId: orgId, userId, status: MemberStatus.active },
    });
    if (!member) {
      throw new ForbiddenException({ code: "ORG_ACCESS_DENIED" });
    }
    (request as { memberId: string }).memberId = member.id;
    (request as { platformRole: string }).platformRole = member.platformRole;
    return true;
  }
}

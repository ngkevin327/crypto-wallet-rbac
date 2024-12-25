import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { MemberStatus, RoleAssignmentStatus } from "@prisma/client";
import { ApiKeysService } from "../../api-keys/api-keys.service";
import { PrismaService } from "../../database/prisma.service";
import type { ApiKeyContext } from "../../common/decorators/api-key-context.decorator";

const RATE_LIMIT_PER_MIN = 60;

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  private readonly usage = new Map<string, { count: number; windowStart: number }>();

  constructor(
    private readonly apiKeys: ApiKeysService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      params?: { orgId?: string };
      apiKeyContext?: ApiKeyContext;
      memberId?: string;
      intentSource?: string;
    }>();

    const auth = request.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      throw new UnauthorizedException({ code: "API_KEY_REQUIRED" });
    }

    const token = auth.slice(7).trim();
    if (!token.startsWith("wtp_live_")) {
      throw new UnauthorizedException({ code: "INVALID_API_KEY" });
    }

    const validated = await this.apiKeys.validateBearerToken(token);
    if (!validated) {
      throw new UnauthorizedException({ code: "INVALID_API_KEY" });
    }

    this.enforceRateLimit(validated.keyId);

    const routeOrgId = request.params?.orgId;
    if (routeOrgId && routeOrgId !== validated.orgId) {
      throw new UnauthorizedException({ code: "API_KEY_ORG_MISMATCH" });
    }

    const assignment = await this.prisma.roleAssignment.findFirst({
      where: {
        roleId: validated.roleId,
        status: RoleAssignmentStatus.active,
        member: {
          organizationId: validated.orgId,
          status: MemberStatus.active,
        },
      },
      include: { member: true },
      orderBy: { createdAt: "asc" },
    });

    if (!assignment) {
      throw new UnauthorizedException({ code: "API_KEY_ROLE_UNASSIGNED" });
    }

    const ctx: ApiKeyContext = {
      keyId: validated.keyId,
      orgId: validated.orgId,
      roleId: validated.roleId,
      memberId: assignment.memberId,
    };

    request.apiKeyContext = ctx;
    request.memberId = assignment.memberId;
    request.intentSource = "api";
    return true;
  }

  private enforceRateLimit(keyId: string): void {
    const now = Date.now();
    const windowMs = 60_000;
    const entry = this.usage.get(keyId);
    if (!entry || now - entry.windowStart >= windowMs) {
      this.usage.set(keyId, { count: 1, windowStart: now });
      return;
    }
    entry.count += 1;
    if (entry.count > RATE_LIMIT_PER_MIN) {
      throw new UnauthorizedException({ code: "API_KEY_RATE_LIMIT" });
    }
  }
}

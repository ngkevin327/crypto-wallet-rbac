import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { createHash, randomBytes } from "crypto";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../database/prisma.service";
import { PasswordService } from "../auth/password.service";

const KEY_PREFIX = "wtp_live_";

@Injectable()
export class ApiKeysService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly audit: AuditService
  ) {}

  async create(orgId: string, name: string, roleId: string, actorUserId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, organizationId: orgId },
    });
    if (!role) {
      throw new NotFoundException({ code: "ROLE_NOT_FOUND" });
    }

    const secretBody = randomBytes(32).toString("base64url");
    const secret = `${KEY_PREFIX}${secretBody}`;
    const keyHash = await this.passwords.hash(secret);
    const keyPrefix = `${KEY_PREFIX}${secretBody.slice(0, 8)}`;

    const row = await this.prisma.apiKey.create({
      data: {
        organizationId: orgId,
        name,
        keyPrefix,
        keyHash,
        roleId,
      },
    });

    await this.audit.append({
      eventType: "api_key.created",
      organizationId: orgId,
      actorId: actorUserId,
      payload: { apiKeyId: row.id, name, roleId, keyPrefix },
    });

    return {
      id: row.id,
      name: row.name,
      keyPrefix: row.keyPrefix,
      secret,
      roleId: row.roleId,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async list(orgId: string) {
    const rows = await this.prisma.apiKey.findMany({
      where: { organizationId: orgId, revokedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      keyPrefix: row.keyPrefix,
      roleId: row.roleId,
      lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async revoke(orgId: string, keyId: string, actorUserId: string) {
    const row = await this.prisma.apiKey.findFirst({
      where: { id: keyId, organizationId: orgId, revokedAt: null },
    });
    if (!row) {
      throw new NotFoundException({ code: "API_KEY_NOT_FOUND" });
    }

    const revoked = await this.prisma.apiKey.update({
      where: { id: keyId },
      data: { revokedAt: new Date() },
    });

    await this.audit.append({
      eventType: "api_key.revoked",
      organizationId: orgId,
      actorId: actorUserId,
      payload: { apiKeyId: keyId, name: row.name },
    });

    return { id: revoked.id, revokedAt: revoked.revokedAt!.toISOString() };
  }

  async validateBearerToken(token: string) {
    if (!token.startsWith(KEY_PREFIX)) {
      return null;
    }
    const prefixHint = `${KEY_PREFIX}${token.slice(KEY_PREFIX.length, KEY_PREFIX.length + 8)}`;
    const candidates = await this.prisma.apiKey.findMany({
      where: {
        keyPrefix: prefixHint,
        revokedAt: null,
      },
      include: { role: true },
    });

    for (const candidate of candidates) {
      const valid = await this.passwords.verify(candidate.keyHash, token);
      if (valid) {
        await this.prisma.apiKey.update({
          where: { id: candidate.id },
          data: { lastUsedAt: new Date() },
        });
        return {
          keyId: candidate.id,
          orgId: candidate.organizationId,
          roleId: candidate.roleId,
        };
      }
    }
    return null;
  }

  static hashForLookup(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}

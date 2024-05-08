import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { DEFAULT_ROLE_TEMPLATES } from "./role-templates";

@Injectable()
export class RoleSeedService {
  private readonly logger = new Logger(RoleSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async seedTemplatesForOrganization(
    orgId: string,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    const client = tx ?? this.prisma;
    await client.role.createMany({
      data: DEFAULT_ROLE_TEMPLATES.map((t) => ({
        organizationId: orgId,
        name: t.name,
        templateType: t.templateType,
      })),
      skipDuplicates: true,
    });
    this.logger.debug(`Seeded ${DEFAULT_ROLE_TEMPLATES.length} role templates for org ${orgId}`);
  }
}

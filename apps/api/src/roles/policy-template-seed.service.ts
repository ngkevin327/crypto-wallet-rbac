import { Injectable, Logger } from "@nestjs/common";
import { readFileSync } from "fs";
import { join } from "path";
import { RoleTemplateType, Prisma } from "@prisma/client";
import { parsePolicyRules } from "@wtp/shared/policy/policy.schema";
import { PrismaService } from "../database/prisma.service";

interface PolicyFixture {
  templateType: RoleTemplateType;
  rules: unknown[];
}

@Injectable()
export class PolicyTemplateSeedService {
  private readonly logger = new Logger(PolicyTemplateSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async seedDefaultPoliciesForOrganization(
    orgId: string,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    const client = tx ?? this.prisma;
    const fixturesDir = join(process.cwd(), "prisma", "fixtures", "policies");
    const files = ["marketing.json", "finance.json", "founder.json"];

    for (const file of files) {
      const raw = readFileSync(join(fixturesDir, file), "utf-8");
      const fixture = JSON.parse(raw) as PolicyFixture;
      const role = await client.role.findFirst({
        where: { organizationId: orgId, templateType: fixture.templateType },
      });
      if (!role) {
        continue;
      }
      const existing = await client.policy.findFirst({
        where: { organizationId: orgId, roleId: role.id, status: "active" },
      });
      if (existing) {
        continue;
      }
      const parsed = parsePolicyRules(fixture.rules);
      if (!parsed.success) {
        this.logger.warn(`Skipping invalid fixture ${file}`);
        continue;
      }
      await client.policy.create({
        data: {
          organizationId: orgId,
          roleId: role.id,
          rules: parsed.rules as unknown as Prisma.InputJsonValue,
          version: 1,
          status: "active",
        },
      });
      this.logger.debug(`Seeded default ${fixture.templateType} policy for org ${orgId}`);
    }
  }
}

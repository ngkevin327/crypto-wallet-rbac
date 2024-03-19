import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("health")
  health(): { status: string } {
    return { status: "ok" };
  }

  @Get("ready")
  async ready(): Promise<{ status: string; checks: Record<string, string> }> {
    const checks: Record<string, string> = { api: "ok" };
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = "ok";
    } catch {
      checks.database = "error";
      return { status: "degraded", checks };
    }
    return { status: "ok", checks };
  }
}

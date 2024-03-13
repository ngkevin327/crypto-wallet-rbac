import { Controller, Get } from "@nestjs/common";

@Controller()
export class HealthController {
  @Get("health")
  health(): { status: string } {
    return { status: "ok" };
  }

  @Get("ready")
  ready(): { status: string; checks: Record<string, string> } {
    // Database check wired when Prisma module lands
    return {
      status: "ok",
      checks: {
        api: "ok",
        database: "skipped",
      },
    };
  }
}

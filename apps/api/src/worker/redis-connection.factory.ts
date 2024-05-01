import type { ConnectionOptions } from "bullmq";
import type { ConfigService } from "@nestjs/config";

export function createBullMqConnection(config: ConfigService): ConnectionOptions {
  const url = config.get<string>("redisUrl");
  if (!url) {
    throw new Error("REDIS_URL is required for BullMQ workers");
  }
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 6379,
    password: parsed.password || undefined,
    username: parsed.username || undefined,
    maxRetriesPerRequest: null,
  };
}

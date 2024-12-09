import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { createHash } from "crypto";
import { RedisService } from "../../redis/redis.service";

const TTL_SECONDS = 24 * 60 * 60;

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  constructor(private readonly redis: RedisService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.method !== "POST" || !req.path.includes("/intents")) {
      next();
      return;
    }

    const key = req.header("idempotency-key");
    if (!key) {
      next();
      return;
    }

    const client = this.redis.getClient();
    if (!client) {
      next();
      return;
    }

    const cacheKey = `idempotency:${createHash("sha256").update(key).digest("hex")}`;
    const cached = await client.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as { status: number; body: unknown };
      res.status(parsed.status).json(parsed.body);
      return;
    }

    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      void client.setex(
        cacheKey,
        TTL_SECONDS,
        JSON.stringify({ status: res.statusCode, body })
      );
      return originalJson(body);
    };

    next();
  }
}

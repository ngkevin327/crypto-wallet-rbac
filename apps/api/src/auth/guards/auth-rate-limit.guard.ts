import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import type { Request } from "express";
import { RedisService } from "../../redis/redis.service";

const WINDOW_SEC = 60;
const MAX_REQUESTS = 10;
const KEY_PREFIX = "auth:rate:";

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const key = `${KEY_PREFIX}${ip}`;

    const client = this.redis.getClient();
    if (!client || !this.redis.isAvailable()) {
      return true;
    }

    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, WINDOW_SEC);
    }

    if (count > MAX_REQUESTS) {
      const ttl = await client.ttl(key);
      const retryAfter = ttl > 0 ? ttl : WINDOW_SEC;
      throw new HttpException(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Too many authentication attempts. Try again later.",
            details: { retryAfter },
          },
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return true;
  }
}

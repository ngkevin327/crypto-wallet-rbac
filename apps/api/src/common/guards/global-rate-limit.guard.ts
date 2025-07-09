import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import type { Request } from "express";

const DEFAULT_LIMIT = Number(process.env.GLOBAL_RATE_LIMIT_PER_MIN ?? 300);
const WINDOW_MS = 60_000;

@Injectable()
export class GlobalRateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, { count: number; resetAt: number }>();

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
      req.socket.remoteAddress ??
      "unknown";

    const now = Date.now();
    const bucket = this.buckets.get(ip);
    if (!bucket || now >= bucket.resetAt) {
      this.buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
      return true;
    }

    bucket.count += 1;
    if (bucket.count > DEFAULT_LIMIT) {
      throw new HttpException(
        { code: "RATE_LIMITED", message: "Too many requests" },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
    return true;
  }
}

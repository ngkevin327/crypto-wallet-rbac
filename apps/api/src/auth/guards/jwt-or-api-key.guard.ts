import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { ApiKeyAuthGuard } from "./api-key-auth.guard";

@Injectable()
export class JwtOrApiKeyGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtAuthGuard,
    private readonly apiKey: ApiKeyAuthGuard
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
    }>();
    const auth = request.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      throw new UnauthorizedException({ code: "AUTH_REQUIRED" });
    }
    const token = auth.slice(7).trim();
    if (token.startsWith("wtp_live_")) {
      return this.apiKey.canActivate(context);
    }
    return this.jwt.canActivate(context) as Promise<boolean>;
  }
}

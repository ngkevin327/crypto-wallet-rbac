import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface ApiKeyContext {
  keyId: string;
  orgId: string;
  roleId: string;
  memberId: string;
}

export const ApiKeyContextParam = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ApiKeyContext | undefined => {
    const request = ctx.switchToHttp().getRequest<{ apiKeyContext?: ApiKeyContext }>();
    return request.apiKeyContext;
  }
);

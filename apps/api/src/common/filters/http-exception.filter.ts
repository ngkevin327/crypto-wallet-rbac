import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { buildApiError } from "../errors/api-error.response";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "INTERNAL_ERROR";
    let message = "An unexpected error occurred";
    let details: Record<string, unknown> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === "string") {
        message = body;
        code = this.codeFromStatus(status);
      } else if (typeof body === "object" && body !== null) {
        const obj = body as Record<string, unknown>;
        message = (obj.message as string) ?? message;
        code = (obj.code as string) ?? this.codeFromStatus(status);
        if (Array.isArray(obj.message)) {
          message = obj.message.join(", ");
          details = { fields: obj.message };
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).json(
      buildApiError(code, message, {
        ...details,
        path: request.url,
      })
    );
  }

  private codeFromStatus(status: number): string {
    const map: Record<number, string> = {
      400: "BAD_REQUEST",
      401: "UNAUTHORIZED",
      403: "FORBIDDEN",
      404: "NOT_FOUND",
      409: "CONFLICT",
      422: "UNPROCESSABLE_ENTITY",
      429: "RATE_LIMITED",
    };
    return map[status] ?? "HTTP_ERROR";
  }
}

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { Observable, tap } from "rxjs";
import { CORRELATION_ID_HEADER } from "../middleware/correlation-id.middleware";

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const started = Date.now();
    const correlationId = req.headers[CORRELATION_ID_HEADER];

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - started;
        // Structured fields consumed by pino-http when request passes through logger
        (req as Request & { _wtpLogged?: boolean }).log?.info?.({
          correlationId,
          method: req.method,
          path: req.url,
          statusCode: res.statusCode,
          durationMs,
        });
      })
    );
  }
}

import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { GlobalRateLimitGuard } from "./common/guards/global-rate-limit.guard";
import { AppConfigModule } from "./config/config.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { RequestLoggingInterceptor } from "./common/interceptors/request-logging.interceptor";
import { CorrelationIdMiddleware } from "./common/middleware/correlation-id.middleware";
import { IdempotencyMiddleware } from "./common/middleware/idempotency.middleware";
import { AuditModule } from "./audit/audit.module";
import { AuthModule } from "./auth/auth.module";
import { OrgModule } from "./org/org.module";
import { IntegrationModule } from "./integration/integration.module";
import { ApprovalModule } from "./approval/approval.module";
import { IntentModule } from "./intent/intent.module";
import { PolicyModule } from "./policy/policy.module";
import { RolesModule } from "./roles/roles.module";
import { WalletModule } from "./wallet/wallet.module";
import { ApiKeysModule } from "./api-keys/api-keys.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { DatabaseModule } from "./database/database.module";
import { RedisModule } from "./redis/redis.module";
import { HealthModule } from "./health/health.module";
import { AppLoggerModule } from "./logger/logger.module";
import { ObservabilityModule } from "./observability/observability.module";

@Module({
  imports: [
    AppConfigModule,
    AppLoggerModule,
    ObservabilityModule,
    AuditModule,
    NotificationsModule,
    ApiKeysModule,
    DatabaseModule,
    RedisModule,
    HealthModule,
    AuthModule,
    OrgModule,
    RolesModule,
    IntegrationModule,
    PolicyModule,
    IntentModule,
    ApprovalModule,
    WalletModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: GlobalRateLimitGuard },
    { provide: APP_INTERCEPTOR, useClass: RequestLoggingInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");
    consumer.apply(IdempotencyMiddleware).forRoutes("orgs/*/intents");
  }
}

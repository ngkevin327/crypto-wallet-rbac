import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { AppConfigModule } from "./config/config.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { RequestLoggingInterceptor } from "./common/interceptors/request-logging.interceptor";
import { CorrelationIdMiddleware } from "./common/middleware/correlation-id.middleware";
import { AuditModule } from "./audit/audit.module";
import { AuthModule } from "./auth/auth.module";
import { OrgModule } from "./org/org.module";
import { IntegrationModule } from "./integration/integration.module";
import { PolicyModule } from "./policy/policy.module";
import { RolesModule } from "./roles/roles.module";
import { WalletModule } from "./wallet/wallet.module";
import { DatabaseModule } from "./database/database.module";
import { RedisModule } from "./redis/redis.module";
import { HealthModule } from "./health/health.module";
import { AppLoggerModule } from "./logger/logger.module";

@Module({
  imports: [
    AppConfigModule,
    AppLoggerModule,
    AuditModule,
    DatabaseModule,
    RedisModule,
    HealthModule,
    AuthModule,
    OrgModule,
    RolesModule,
    IntegrationModule,
    PolicyModule,
    WalletModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: RequestLoggingInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");
  }
}

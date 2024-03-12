import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { AppConfigModule } from "./config/config.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { AppLoggerModule } from "./logger/logger.module";

@Module({
  imports: [AppConfigModule, AppLoggerModule],
  providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }],
})
export class AppModule {}

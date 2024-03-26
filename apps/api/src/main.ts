import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { defaultValidationPipeOptions } from "./common/pipes/validation-options";
import { ConfigService } from "@nestjs/config";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe(defaultValidationPipeOptions));
  app.use(cookieParser());

  const config = app.get(ConfigService);
  const port = config.get<number>("port") ?? 3001;
  const prefix = config.get<string>("apiPrefix") ?? "v1";

  app.setGlobalPrefix(prefix);

  await app.listen(port);
  const logger = app.get(Logger);
  logger.log(`API listening on port ${port} (prefix /${prefix})`);
}

bootstrap();

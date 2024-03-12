import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoggerModule as PinoLoggerModule } from "nestjs-pino";

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isDev = config.get<string>("nodeEnv") === "development";
        return {
          pinoHttp: {
            level: config.get<string>("logLevel") ?? "info",
            transport: isDev
              ? { target: "pino-pretty", options: { singleLine: true } }
              : undefined,
            redact: ["req.headers.authorization", "req.headers.cookie"],
          },
        };
      },
    }),
  ],
})
export class AppLoggerModule {}

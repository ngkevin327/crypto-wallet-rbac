import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import configuration from "./configuration";
import { envSchema } from "./env.schema";

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: (config) => {
        const result = envSchema.safeParse({
          NODE_ENV: config.NODE_ENV ?? process.env.NODE_ENV,
          PORT: config.PORT ?? process.env.PORT,
          API_PREFIX: config.API_PREFIX ?? process.env.API_PREFIX,
          DATABASE_URL: config.DATABASE_URL ?? process.env.DATABASE_URL,
          REDIS_URL: config.REDIS_URL ?? process.env.REDIS_URL,
          JWT_ACCESS_SECRET: config.JWT_ACCESS_SECRET ?? process.env.JWT_ACCESS_SECRET,
          LOG_LEVEL: config.LOG_LEVEL ?? process.env.LOG_LEVEL,
        });
        if (!result.success) {
          throw new Error(`Invalid environment: ${result.error.message}`);
        }
        return result.data;
      },
    }),
  ],
})
export class AppConfigModule {}

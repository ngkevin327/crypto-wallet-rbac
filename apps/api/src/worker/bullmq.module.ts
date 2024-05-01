import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createBullMqConnection } from "./redis-connection.factory";

export const BULLMQ_CONNECTION = "BULLMQ_CONNECTION";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: BULLMQ_CONNECTION,
      useFactory: (config: ConfigService) => createBullMqConnection(config),
      inject: [ConfigService],
    },
  ],
  exports: [BULLMQ_CONNECTION],
})
export class BullMqModule {}

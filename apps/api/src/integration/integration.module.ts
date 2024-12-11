import { Module } from "@nestjs/common";
import { PRICE_ORACLE_PORT } from "@wtp/shared/integration/price-oracle.port";
import { CoinGeckoAdapter } from "./coingecko.adapter";
import { PriceCacheService } from "./price-cache.service";
import { S3Adapter } from "./s3.adapter";

@Module({
  providers: [
    PriceCacheService,
    CoinGeckoAdapter,
    S3Adapter,
    { provide: PRICE_ORACLE_PORT, useExisting: CoinGeckoAdapter },
  ],
  exports: [PriceCacheService, CoinGeckoAdapter, PRICE_ORACLE_PORT, S3Adapter],
})
export class IntegrationModule {}

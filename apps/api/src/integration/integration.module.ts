import { Module } from "@nestjs/common";
import { PRICE_ORACLE_PORT } from "@wtp/shared/integration/price-oracle.port";
import { CoinGeckoAdapter } from "./coingecko.adapter";
import { PriceCacheService } from "./price-cache.service";

@Module({
  providers: [
    PriceCacheService,
    CoinGeckoAdapter,
    { provide: PRICE_ORACLE_PORT, useExisting: CoinGeckoAdapter },
  ],
  exports: [PriceCacheService, CoinGeckoAdapter, PRICE_ORACLE_PORT],
})
export class IntegrationModule {}

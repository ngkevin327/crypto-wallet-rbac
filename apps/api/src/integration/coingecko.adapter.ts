import { Injectable, Logger } from "@nestjs/common";
import type { PriceOraclePort, TokenPriceQuery } from "@wtp/shared/integration/price-oracle.port";
import { PriceCacheService } from "./price-cache.service";
import { resolveTokenEntry } from "./token-registry";

interface CoinGeckoPriceResponse {
  [id: string]: { usd?: number };
}

@Injectable()
export class CoinGeckoAdapter implements PriceOraclePort {
  private readonly logger = new Logger(CoinGeckoAdapter.name);

  constructor(private readonly cache: PriceCacheService) {}

  async getUsdPrice(query: TokenPriceQuery): Promise<number> {
    const cached = await this.cache.get(query.chainId, query.tokenAddress);
    if (cached != null) {
      return cached;
    }

    const entry = resolveTokenEntry(query.chainId, query.tokenAddress);
    if (!entry) {
      this.logger.warn(
        `Unknown token ${query.tokenAddress} on chain ${query.chainId} for price lookup`
      );
      throw new Error("TOKEN_NOT_IN_REGISTRY");
    }

    const apiKey = process.env.COINGECKO_API_KEY;
    const baseUrl = "https://api.coingecko.com/api/v3/simple/price";
    const url = new URL(baseUrl);
    url.searchParams.set("ids", entry.coingeckoId);
    url.searchParams.set("vs_currencies", "usd");
    if (apiKey) {
      url.searchParams.set("x_cg_demo_api_key", apiKey);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      this.logger.warn(`CoinGecko HTTP ${response.status} for ${entry.coingeckoId}`);
      throw new Error("COINGECKO_HTTP_ERROR");
    }

    const body = (await response.json()) as CoinGeckoPriceResponse;
    const usd = body[entry.coingeckoId]?.usd;
    if (usd == null || usd <= 0) {
      throw new Error("COINGECKO_PRICE_MISSING");
    }

    await this.cache.set(query.chainId, query.tokenAddress, usd);
    return usd;
  }
}

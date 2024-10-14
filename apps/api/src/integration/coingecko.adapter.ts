import { Injectable, Logger } from "@nestjs/common";
import type { PriceOraclePort, TokenPriceQuery } from "@wtp/shared/integration/price-oracle.port";
import { PriceUnavailableError } from "./errors/price-unavailable.error";
import { PriceCacheService } from "./price-cache.service";
import { resolveTokenEntry } from "./token-registry";

const FETCH_TIMEOUT_MS = 3000;
const MAX_RETRIES = 2;

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
      throw new PriceUnavailableError(
        "TOKEN_NOT_IN_REGISTRY",
        query.chainId,
        query.tokenAddress
      );
    }

    const usd = await this.fetchWithRetry(entry.coingeckoId, query);
    await this.cache.set(query.chainId, query.tokenAddress, usd);
    return usd;
  }

  private async fetchWithRetry(coingeckoId: string, query: TokenPriceQuery): Promise<number> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await this.fetchUsdPrice(coingeckoId);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
        }
      }
    }
    this.logger.warn(
      `CoinGecko failed for ${coingeckoId} chain=${query.chainId} token=${query.tokenAddress}: ${lastError?.message}`
    );
    throw new PriceUnavailableError(
      lastError?.message ?? "oracle unavailable",
      query.chainId,
      query.tokenAddress
    );
  }

  private async fetchUsdPrice(coingeckoId: string): Promise<number> {
    const apiKey = process.env.COINGECKO_API_KEY;
    const url = new URL("https://api.coingecko.com/api/v3/simple/price");
    url.searchParams.set("ids", coingeckoId);
    url.searchParams.set("vs_currencies", "usd");
    if (apiKey) {
      url.searchParams.set("x_cg_demo_api_key", apiKey);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(url.toString(), { signal: controller.signal });
      if (!response.ok) {
        throw new PriceUnavailableError(`HTTP ${response.status}`);
      }
      const body = (await response.json()) as CoinGeckoPriceResponse;
      const usd = body[coingeckoId]?.usd;
      if (usd == null || usd <= 0) {
        throw new PriceUnavailableError("price missing in response");
      }
      return usd;
    } catch (err) {
      if (err instanceof PriceUnavailableError) {
        throw err;
      }
      throw new PriceUnavailableError(err instanceof Error ? err.message : "fetch failed");
    } finally {
      clearTimeout(timer);
    }
  }
}

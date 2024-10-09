import { Injectable } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";

const TTL_SECONDS = 60;

@Injectable()
export class PriceCacheService {
  constructor(private readonly redis: RedisService) {}

  cacheKey(chainId: number, tokenAddress: string): string {
    return `price:${chainId}:${tokenAddress.toLowerCase()}`;
  }

  async get(chainId: number, tokenAddress: string): Promise<number | null> {
    const client = this.redis.getClient();
    if (!client) {
      return null;
    }
    const raw = await client.get(this.cacheKey(chainId, tokenAddress));
    if (!raw) {
      return null;
    }
    const price = Number(raw);
    return Number.isFinite(price) ? price : null;
  }

  async set(chainId: number, tokenAddress: string, usdPrice: number): Promise<void> {
    const client = this.redis.getClient();
    if (!client) {
      return;
    }
    await client.set(
      this.cacheKey(chainId, tokenAddress),
      String(usdPrice),
      "EX",
      TTL_SECONDS
    );
  }
}

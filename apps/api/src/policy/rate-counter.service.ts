import { Injectable } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";
import type { RateCounters } from "@wtp/policy-engine";

@Injectable()
export class RateCounterService {
  constructor(private readonly redis: RedisService) {}

  dailyKey(orgId: string, memberId: string, date = new Date()): string {
    const day = date.toISOString().slice(0, 10);
    return `rate:usd:${orgId}:${memberId}:${day}`;
  }

  hourlyTxKey(orgId: string, memberId: string, date = new Date()): string {
    const hour = date.toISOString().slice(0, 13);
    return `rate:tx:${orgId}:${memberId}:${hour}`;
  }

  async incrementDailyUsd(orgId: string, memberId: string, amountUsd: number): Promise<void> {
    const client = this.redis.getClient();
    if (!client) {
      return;
    }
    const key = this.dailyKey(orgId, memberId);
    await client.incrbyfloat(key, amountUsd);
    await client.expire(key, 25 * 60 * 60);
  }

  async incrementHourlyTx(orgId: string, memberId: string): Promise<void> {
    const client = this.redis.getClient();
    if (!client) {
      return;
    }
    const key = this.hourlyTxKey(orgId, memberId);
    await client.incr(key);
    await client.expire(key, 60 * 60);
  }

  async getCounters(orgId: string, memberId: string): Promise<RateCounters> {
    const client = this.redis.getClient();
    if (!client) {
      return { dailyUsdSpent: 0, txCountLastHour: 0 };
    }
    const [dailyRaw, txRaw] = await Promise.all([
      client.get(this.dailyKey(orgId, memberId)),
      client.get(this.hourlyTxKey(orgId, memberId)),
    ]);
    return {
      dailyUsdSpent: dailyRaw ? Number(dailyRaw) : 0,
      txCountLastHour: txRaw ? Number(txRaw) : 0,
    };
  }
}

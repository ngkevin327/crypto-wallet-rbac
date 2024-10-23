import { RateCounterService } from "./rate-counter.service";

describe("RateCounterService", () => {
  it("increments daily USD with TTL", async () => {
    const store = new Map<string, string>();
    const client = {
      incrbyfloat: jest.fn(async (key: string, v: number) => {
        store.set(key, String(Number(store.get(key) ?? 0) + v));
        return store.get(key);
      }),
      expire: jest.fn(),
      get: jest.fn(async (key: string) => store.get(key) ?? null),
      incr: jest.fn(),
    };
    const redis = { getClient: () => client };
    const service = new RateCounterService(redis as never);

    await service.incrementDailyUsd("org", "member", 50);
    expect(client.incrbyfloat).toHaveBeenCalled();
    expect(client.expire).toHaveBeenCalledWith(expect.stringContaining("rate:usd:"), 25 * 60 * 60);
  });

  it("returns counter snapshot", async () => {
    const client = {
      get: jest
        .fn()
        .mockResolvedValueOnce("1500")
        .mockResolvedValueOnce("2"),
      incrbyfloat: jest.fn(),
      expire: jest.fn(),
      incr: jest.fn(),
    };
    const redis = { getClient: () => client };
    const service = new RateCounterService(redis as never);
    const counters = await service.getCounters("org", "member");
    expect(counters).toEqual({ dailyUsdSpent: 1500, txCountLastHour: 2 });
  });
});

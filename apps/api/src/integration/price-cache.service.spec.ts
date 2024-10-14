import { PriceCacheService } from "./price-cache.service";

describe("PriceCacheService", () => {
  it("builds deterministic cache keys", () => {
    const redis = { getClient: () => null };
    const service = new PriceCacheService(redis as never);
    expect(service.cacheKey(11155111, "0xAbC")).toBe("price:11155111:0xabc");
  });

  it("returns null when redis is unavailable", async () => {
    const redis = { getClient: () => null };
    const service = new PriceCacheService(redis as never);
    await expect(service.get(1, "0xabc")).resolves.toBeNull();
  });

  it("reads and writes cached values", async () => {
    const store = new Map<string, string>();
    const client = {
      get: jest.fn(async (key: string) => store.get(key) ?? null),
      set: jest.fn(async (key: string, value: string) => {
        store.set(key, value);
        return "OK";
      }),
    };
    const redis = { getClient: () => client };
    const service = new PriceCacheService(redis as never);

    await service.set(1, "0xabc", 1.5);
    await expect(service.get(1, "0xabc")).resolves.toBe(1.5);
    expect(client.set).toHaveBeenCalledWith("price:1:0xabc", "1.5", "EX", 60);
  });
});

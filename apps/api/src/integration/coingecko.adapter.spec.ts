import { CoinGeckoAdapter } from "./coingecko.adapter";
import { PriceUnavailableError } from "./errors/price-unavailable.error";
import { PriceCacheService } from "./price-cache.service";

describe("CoinGeckoAdapter", () => {
  const cache = {
    get: jest.fn(),
    set: jest.fn(),
    cacheKey: jest.fn(),
  } as unknown as PriceCacheService;

  let adapter: CoinGeckoAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new CoinGeckoAdapter(cache);
    (cache.get as jest.Mock).mockResolvedValue(null);
  });

  it("returns cached price without HTTP call", async () => {
    (cache.get as jest.Mock).mockResolvedValue(1.01);
    const fetchSpy = jest.spyOn(global, "fetch");

    const price = await adapter.getUsdPrice({
      chainId: 1,
      tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    });

    expect(price).toBe(1.01);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("fetches and caches price on miss", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ "usd-coin": { usd: 1 } }),
    } as Response);

    const price = await adapter.getUsdPrice({
      chainId: 1,
      tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    });

    expect(price).toBe(1);
    expect(cache.set).toHaveBeenCalled();
  });

  it("throws PriceUnavailableError on HTTP 500", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({ ok: false, status: 500 } as Response);

    await expect(
      adapter.getUsdPrice({
        chainId: 1,
        tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      })
    ).rejects.toMatchObject({ code: "PRICE_UNAVAILABLE" });
  });
});

/**
 * Nightly smoke: fetch Sepolia USDC USD price from CoinGecko.
 */
const SEPOLIA_USDC = "0x1c7d4b196cb0c7b4b7ba5bbd7412162b4c447b4";
const CHAIN_ID = 11155111;

async function main(): Promise<void> {
  const url = new URL("https://api.coingecko.com/api/v3/simple/price");
  url.searchParams.set("ids", "usd-coin");
  url.searchParams.set("vs_currencies", "usd");
  const apiKey = process.env.COINGECKO_API_KEY;
  if (apiKey) {
    url.searchParams.set("x_cg_demo_api_key", apiKey);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`CoinGecko smoke failed: HTTP ${res.status}`);
  }
  const body = (await res.json()) as { "usd-coin"?: { usd?: number } };
  const price = body["usd-coin"]?.usd;
  if (price == null || price <= 0) {
    throw new Error(`Invalid USDC price for ${SEPOLIA_USDC} on chain ${CHAIN_ID}`);
  }
  console.log(`Smoke OK: USDC price=${price}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export interface TokenRegistryEntry {
  symbol: string;
  coingeckoId: string;
  decimals: number;
}

const MAINNET_USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const MAINNET_USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const MAINNET_WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const SEPOLIA_USDC = "0x1c7d4b196cb0c7b4b7ba5bbd7412162b4c447b4";

/** Known token contract addresses mapped to CoinGecko ids. */
export const TOKEN_REGISTRY: Record<number, Record<string, TokenRegistryEntry>> = {
  1: {
    [MAINNET_USDC]: { symbol: "USDC", coingeckoId: "usd-coin", decimals: 6 },
    [MAINNET_USDT]: { symbol: "USDT", coingeckoId: "tether", decimals: 6 },
    [MAINNET_WETH]: { symbol: "WETH", coingeckoId: "weth", decimals: 18 },
  },
  11155111: {
    [SEPOLIA_USDC]: { symbol: "USDC", coingeckoId: "usd-coin", decimals: 6 },
  },
};

export function resolveTokenEntry(
  chainId: number,
  tokenAddress: string
): TokenRegistryEntry | null {
  const chain = TOKEN_REGISTRY[chainId];
  if (!chain) {
    return null;
  }
  return chain[tokenAddress.toLowerCase()] ?? null;
}

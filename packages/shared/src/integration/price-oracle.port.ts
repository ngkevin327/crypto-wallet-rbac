export interface TokenPriceQuery {
  chainId: number;
  tokenAddress: string;
}

export interface PriceOraclePort {
  /**
   * Returns USD price for a token contract on the given chain.
   * Implementations must throw `PriceUnavailableError` when price cannot be fetched.
   */
  getUsdPrice(query: TokenPriceQuery): Promise<number>;
}

export const PRICE_ORACLE_PORT = Symbol("PRICE_ORACLE_PORT");

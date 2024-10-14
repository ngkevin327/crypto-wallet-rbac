export const PRICE_UNAVAILABLE = "PRICE_UNAVAILABLE";

export class PriceUnavailableError extends Error {
  readonly code = PRICE_UNAVAILABLE;

  constructor(
    message: string,
    readonly chainId?: number,
    readonly tokenAddress?: string
  ) {
    super(message);
    this.name = "PriceUnavailableError";
  }
}

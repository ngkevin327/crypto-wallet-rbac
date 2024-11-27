export class SafeApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly retryable: boolean,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "SafeApiError";
  }
}

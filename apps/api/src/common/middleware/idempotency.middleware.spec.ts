import { IdempotencyMiddleware } from "./idempotency.middleware";

describe("IdempotencyMiddleware", () => {
  it("skips non-POST requests", async () => {
    const redis = { getClient: () => null };
    const middleware = new IdempotencyMiddleware(redis as never);
    const next = jest.fn();
    await middleware.use(
      { method: "GET", path: "/v1/orgs/x/intents" } as never,
      {} as never,
      next
    );
    expect(next).toHaveBeenCalled();
  });
});

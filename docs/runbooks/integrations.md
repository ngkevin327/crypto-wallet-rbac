# Integrations runbook

## Price oracle (CoinGecko)

The API resolves token amounts to USD via `CoinGeckoAdapter` with Redis caching.

| Setting | Description |
|---------|-------------|
| `COINGECKO_API_KEY` | Optional demo/pro API key |
| Cache key | `price:{chainId}:{tokenAddress}` |
| TTL | 60 seconds |

### Fail-closed behavior

If the oracle times out (3s) or fails after 2 retries, policy evaluation returns `DENY` with reason `POLICY_DENIED_PRICE_UNAVAILABLE`.

### Nightly smoke

Workflow: `.github/workflows/nightly-smoke.yml` (06:00 UTC daily).

```bash
COINGECKO_API_KEY=your-key pnpm --filter @wtp/api exec tsx scripts/smoke-price-oracle.ts
```

Skipped automatically when `COINGECKO_API_KEY` is not configured (fork PRs).

### Supported tokens

See `apps/api/src/integration/token-registry.ts` for Sepolia/mainnet USDC, USDT, and WETH mappings.

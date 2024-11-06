# Policy rule DSL

Policies are versioned JSON arrays stored on the `policies` table. Each element is a discriminated object with a `type` field.

## Rule types

### `token_allowlist`

Restrict transfers to listed ERC-20 contract addresses.

```json
{
  "type": "token_allowlist",
  "addresses": ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"]
}
```

### `wallet_allowlist`

Limit operations to specific organization wallet IDs.

```json
{
  "type": "wallet_allowlist",
  "walletIds": ["550e8400-e29b-41d4-a716-446655440000"]
}
```

### `max_usd_per_transaction`

Deny when `intent.amountUsd` exceeds `maxUsd`.

### `max_usd_per_day`

Uses rolling daily counter from Redis (`rate:usd:{orgId}:{memberId}:{date}`).

### `max_transactions_per_hour`

Uses hourly tx counter (`rate:tx:{orgId}:{memberId}:{hour}`).

### `require_approval`

Returns `REQUIRE_APPROVAL` with `approverCount` and optional `approverRoleIds`.

```json
{
  "type": "require_approval",
  "approverCount": 2,
  "approverRoleIds": ["role-uuid"]
}
```

## Reason codes

| Code | Meaning |
|------|---------|
| `POLICY_DENIED_TOKEN_NOT_ALLOWED` | Token not in allowlist |
| `POLICY_DENIED_WALLET_NOT_ALLOWED` | Wallet not in scope |
| `POLICY_DENIED_EXCEEDS_PER_TX` | Per-transaction USD cap |
| `POLICY_DENIED_EXCEEDS_DAILY` | Daily USD cap |
| `POLICY_DENIED_RATE_LIMIT` | Hourly transaction count |
| `POLICY_DENIED_APPROVAL_REQUIRED` | Needs quorum approval |
| `POLICY_DENIED_PRICE_UNAVAILABLE` | Oracle fail-closed deny |
| `INVALID_POLICY_RULE` | Validation error on create/update |

## Validation

Client and API validate rules with `PolicyRulesSchema` from `@wtp/shared/policy`.

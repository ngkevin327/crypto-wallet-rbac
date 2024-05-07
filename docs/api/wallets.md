# Wallet API (`/v1/orgs/:orgId/wallets`)

All endpoints require a Bearer access token and active organization membership.

## List wallets

`GET /v1/orgs/:orgId/wallets`

Returns connected Gnosis Safe instances for the organization, including:

| Field | Description |
|-------|-------------|
| `address` | Checksummed Safe proxy address |
| `chainId` | EVM chain id (`1` mainnet, `11155111` Sepolia) |
| `safeThreshold` | Required owner signatures |
| `safeOwners` | Owner addresses last synced from chain |
| `lastSyncedAt` | ISO timestamp of last background sync |

## Connect flow

### 1. Start connect

`POST /v1/orgs/:orgId/wallets/connect`

```json
{
  "address": "0x…",
  "chainId": 11155111,
  "nickname": "Treasury Safe"
}
```

Response:

```json
{
  "challengeId": "uuid",
  "message": "Wallet Team Permissions — verify Safe ownership\n…",
  "expiresAt": "2025-05-19T12:00:00.000Z"
}
```

The API validates the contract is a Gnosis Safe on the given chain before issuing the challenge.

### 2. Verify signature

`POST /v1/orgs/:orgId/wallets/verify`

```json
{
  "address": "0x…",
  "chainId": 11155111,
  "challengeId": "uuid",
  "signature": "0x…"
}
```

The recovered signer must be an owner of the Safe. On success the wallet is persisted and a background sync job is enqueued.

## Get wallet

`GET /v1/orgs/:orgId/wallets/:walletId`

Returns a single wallet record scoped to the organization.

## OpenAPI

Interactive documentation: `GET /v1/docs` when the API is running locally.

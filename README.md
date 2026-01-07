# Wallet Team Permissions (WTP)

B2B SaaS platform for role-based access control, spending limits, approval workflows, and audit logging over crypto team wallets. WTP integrates with existing multisig wallets (Gnosis Safe first) and does not custody private keys.

## Target users

Crypto startups, DAO operations teams, and Web3 agencies (typically 5–50 people) that need governed treasury operations without sharing root wallet access in chat apps.

## Architecture overview

| Layer | Stack |
|-------|--------|
| API | NestJS, PostgreSQL (Prisma), Redis, BullMQ workers |
| Web | Next.js (App Router), TypeScript |
| Shared | Policy engine package, wallet adapters, shared types |
| Integrations | Gnosis Safe Transaction Service, Ethereum RPC, price oracle |

The API is a modular monolith: domain modules for auth, organizations, wallets, policies, intents, approvals, and audit. Background workers handle wallet sync, approval expiry, and transaction status polling.

## Requirements

- Node.js 20+
- pnpm 9+
- Docker (PostgreSQL 15, Redis 7)

## Local development

1) Install dependencies:

```bash
pnpm install
```

2) Create local env files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

3) Run deterministic bootstrap (DB + Prisma + builds):

```bash
pnpm setup:local
```

Equivalent expanded steps:

```bash
pnpm db:up
pnpm db:wait
pnpm --filter @wtp/api db:generate
pnpm --filter @wtp/api exec prisma migrate deploy
pnpm build
```

4) Start the app:

```bash
pnpm dev            # API :3001, web :3000
```

Background workers (wallet sync, approval expiry) run as a separate process:

```bash
pnpm dev:worker
```

Or start the worker container with Docker Compose:

```bash
docker compose --profile workers up -d
```

| Script | Description |
|--------|-------------|
| `pnpm db:up` | Start Postgres and Redis containers |
| `pnpm db:down` | Stop containers |
| `pnpm db:wait` | Block until Postgres accepts connections |
| `pnpm setup:local` | Run DB startup, Prisma generate/migrate, and workspace build |
| `pnpm verify:local` | Check API health/ready and web landing response |
| `pnpm dev:worker` | Run API background worker locally |

### Required vs optional local env

API env (`apps/api/.env`):

- Required to boot core product locally: `DATABASE_URL`, `JWT_ACCESS_SECRET`
- Required for background workers: `REDIS_URL`
- Required for Safe/RPC integration checks: `ETH_RPC_URL_SEPOLIA`, `ETH_RPC_URL_MAINNET`
- Optional for local MVP core: `COINGECKO_API_KEY`, `SES_*`, `AWS_REGION`, `S3_AUDIT_EXPORT_BUCKET`

Web env (`apps/web/.env`):

- Required: `NEXT_PUBLIC_API_URL`
- Optional (future wallet-connect UI): `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### Verify the product is running locally

With `pnpm dev` running, execute:

```bash
pnpm verify:local
```

Expected result:

- `PASS api-health`
- `PASS api-ready`
- `PASS web`
- `Local verification passed.`

## Build and test

```bash
pnpm build
pnpm typecheck
pnpm lint
pnpm test
```

## Deployment overview

Production runs on AWS (ECS Fargate, RDS PostgreSQL, ElastiCache Redis) behind an ALB. See `infra/` and runbooks under `docs/runbooks/` when added. Secrets are injected via the platform secret store—never commit `.env` files.

## Repository layout

```
apps/api          REST API and workers
apps/web          Admin dashboard
packages/shared   Shared types and utilities
packages/policy-engine   Pure policy evaluation
docs/adr          Architecture decision records
docs/developer    Policy DSL and evaluation flow
docs/runbooks     Operational runbooks
```

Developer guides:

- [Policy rule DSL](docs/developer/policy-dsl.md)
- [Policy evaluation flow](docs/developer/policy-evaluation-flow.md)

## License

Proprietary. All rights reserved.

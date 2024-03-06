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

Start infrastructure:

```bash
docker compose up -d
```

Then install and run apps:

```bash
pnpm install
pnpm db:wait        # wait for Postgres (after compose is up)
pnpm dev            # API :3001, web :3000
```

Or use `pnpm db:up` as an alias for `docker compose up -d`.

| Script | Description |
|--------|-------------|
| `pnpm db:up` | Start Postgres and Redis containers |
| `pnpm db:down` | Stop containers |
| `pnpm db:wait` | Block until Postgres accepts connections |

Copy environment templates:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

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
```

## License

Proprietary. All rights reserved.

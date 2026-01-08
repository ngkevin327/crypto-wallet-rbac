# Local MVP validation report

Date: 2026-05-20  
Scope: local developer bootstrap, runtime smoke checks, and MVP acceptance coverage status.

## Local run status

### What runs locally now

- Docker services: PostgreSQL + Redis (`pnpm db:up`, `pnpm db:wait`) -> pass
- API schema/bootstrap: Prisma generate + schema sync (`pnpm setup:local`) -> pass
- API runtime: starts after module and guard dependency fixes -> pass on `http://localhost:3001`
- Web runtime: starts on `http://localhost:3000` -> pass
- Local smoke verification (`pnpm verify:local`) -> pass

### Evidence commands and outcomes

| Command | Outcome |
|---|---|
| `pnpm setup:local` | PASS (db up, db wait, prisma generate, prisma db push) |
| `pnpm verify:local` | PASS (`api-health`, `api-ready`, `web`) |
| `pnpm typecheck` | FAIL (workspace-level pre-existing web typecheck issues) |
| `pnpm lint` | FAIL (large pre-existing lint backlog in api + web) |
| `pnpm test:mvp-acceptance` | FAIL (criterion #2 test currently returns 400 in policy evaluate step) |

## MVP acceptance matrix (PRD §19)

| Criterion | Current status | Evidence | Missing pieces | Recommended next action |
|---|---|---|---|---|
| 1. Connect Safe on Sepolia and create $2K/day USDC marketing policy | Not tested locally in this run | No automated end-to-end Safe connect test run | Needs real RPC credentials + Safe e2e flow automation | Add Playwright/API e2e with seeded org + Safe integration fixture |
| 2. Marketing user can auto-execute intent under limit | Partial / failing automation | `pnpm test:mvp-acceptance` fails in policy evaluate expectation (400) | Validation/payload mismatch in current acceptance test path | Fix test fixture/request payload and assert deterministic 2xx decision |
| 3. High-value intent blocks until 2 approvers | Partial | Covered conceptually in docs; not passing full automated suite in this run | End-to-end dual-approval flow not green in acceptance command | Add/repair dedicated e2e for 2-approver state transitions |
| 4. Temporary role expires and next intent is denied | Partial (not rerun in this pass) | Existing `contractor-deploy.e2e` exists in repo | Not part of currently passing acceptance gate | Include this test in a green acceptance workflow and record artifacts |
| 5. Audit log has complete trail and CSV export | Partial | Existing `audit-export.e2e` exists; acceptance command currently not green | Depends on failing acceptance baseline and broader e2e stability | Stabilize acceptance suite and include export artifact assertion |
| 6. No critical/high vulnerabilities open from pen test | Not tested locally | No security scan/pen test run in this pass | Security process outside local smoke scope | Run SAST/dependency scans + scheduled external pen test before beta |
| 7. 99.5% uptime during 30-day beta | Not testable in local session | Requires staging/production telemetry period | No soak/uptime measurement framework in local flow | Define SLO monitoring and run staged soak before launch |

## What is still missing for MVP readiness

1. **Green acceptance test gate**: `pnpm test:mvp-acceptance` is not passing.
2. **Reliable Safe integration test path**: criterion #1 and #3 still need robust automated proof with real integration fixtures.
3. **Quality gate debt**: workspace `typecheck` and `lint` are not green due pre-existing issues.
4. **Release hardening evidence**: security and uptime criteria are not yet executable from local workflows.

## Repro commands

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
pnpm setup:local
pnpm --filter @wtp/api dev
pnpm --filter @wtp/web dev
pnpm verify:local
pnpm test:mvp-acceptance
pnpm typecheck
pnpm lint
```

## Notes

- `setup:local` uses `prisma db push` for local schema sync because historical migration order currently breaks fresh `migrate deploy` in local bootstrap.
- Runtime blockers fixed in this pass:
  - circular module import between policy/roles/intent modules,
  - missing `JwtAuthGuard` provider export for `JwtOrApiKeyGuard`,
  - package subpath resolution for `@wtp/shared/*` via package exports.

# MVP Run Execution Report

**Project:** Wallet Team Permissions (WTP)  
**Date:** 2026-05-21 (last updated)  
**Environment:** Windows 10, Node 20+, pnpm 9, Docker Desktop  
**Repository:** `D:\Projects\Fake Git\real 1`

---

## Executive summary

This report documents an end-to-end MVP validation run: making local setup deterministic, starting the product locally, verifying core flows, mapping gaps against PRD §19 acceptance criteria, and committing progress in small checkpoints.

**Outcome:** The product can run locally (API + Web + DB/Redis). Smoke verification passes. Dashboard UI was unified onto a shared design system (`010e8da`, `3a9ac35`) with **no detected MVP functional regressions**. Full MVP acceptance automation is **still not green** (`pnpm test:mvp-acceptance` fails on criterion #2 — same API-level issue as before UI work). Workspace `typecheck` and `lint` remain failing due to pre-existing debt.

---

## Objectives (requested scope)

1. Prepare repo for MVP validation with deterministic first-run setup.
2. Run product locally and confirm health/UI availability.
3. Validate core flows (auth, policy, approvals, audit) where possible without external credentials.
4. Compare results to MVP docs and acceptance criteria; produce a gap matrix.
5. Update runbooks/checklists for reproducible local verification.
6. Commit after each meaningful step (no squash, no push).

---

## Phase A — Baseline and setup

### What was inspected

- `README.md`, `CONTRIBUTING.md`, root `package.json`
- `apps/api/.env.example`, `apps/web/.env.example`
- `docker-compose.yml`, Prisma migrations under `apps/api/prisma/migrations`
- CI workflow (`.github/workflows/ci.yml`) for expected bootstrap steps
- MVP docs: `docs/mvp-acceptance-checklist.md`, PRD §19 criteria

### Gaps found in original docs

| Gap | Impact |
|-----|--------|
| No `prisma generate` / migrate in README first-run flow | Fresh clone fails before `pnpm dev` |
| No shared package build guidance before dev | API imports `@wtp/shared` / `@wtp/policy-engine` from `dist/` |
| `migrate deploy` fails on fresh DB (migration order) | `20250519120000_wallet_safe_owners` runs before `wallets` table exists |
| No single-command local verification | Hard to confirm “working product” quickly |

### Changes made

| File | Change |
|------|--------|
| `package.json` | Added `setup:local`, `verify:local`, `dev:worker` |
| `scripts/verify-local.ts` | New smoke script (API health/ready + web title) |
| `README.md` | Step-by-step bootstrap, required vs optional env vars |
| `CONTRIBUTING.md` | Aligned local setup with `setup:local` + `verify:local` |
| `apps/api/package.json` | Added `db:push` script |

**Commit:** `cf281a9` — `chore(devx): add deterministic local setup and smoke verification`

---

## Phase B — Run locally

### Infrastructure

```bash
pnpm install
# env files created from .env.example if missing
pnpm setup:local   # db:up -> db:wait -> prisma generate -> prisma db push
```

**Blockers encountered and resolved:**

| Blocker | Resolution |
|---------|------------|
| Docker daemon not running | Started Docker Desktop / `com.docker.service` |
| `prisma migrate deploy` fails (missing `wallets` table) | Switched local bootstrap to `prisma db push` |
| API TypeScript compile errors (42 errors) | Fixed module wiring, tsconfig paths, compile issues |
| API runtime: `Cannot find module '@wtp/shared/policy/reason-codes'` | Added `exports` map in `packages/shared/package.json` |
| Nest circular dependency PolicyModule ↔ RolesModule ↔ IntentModule | `forwardRef()` in `policy.module.ts` and `intent.module.ts` |
| `JwtOrApiKeyGuard` missing `JwtAuthGuard` in IntentModule | Export `JwtAuthGuard` from `AuthModule` |
| Port 3000 conflict (foreign process) | Stopped stale listener; started web separately |

### Runtime confirmation

| Service | URL | Status |
|---------|-----|--------|
| API health | `http://localhost:3001/v1/health` | `{"status":"ok"}` |
| API ready | `http://localhost:3001/v1/ready` | DB check ok |
| Web | `http://localhost:3000` | Ready (login page) |

**Commands used:**

```bash
pnpm --filter @wtp/api dev    # API (separate terminal)
pnpm --filter @wtp/web dev    # Web (separate terminal)
pnpm verify:local             # PASS all three checks
```

**Commit:** `a9e12f7` — `fix(local): unblock API startup and schema bootstrap flow`

---

## Phase C — Working product verification

### Commands executed and results

| Command | Result | Notes |
|---------|--------|-------|
| `pnpm setup:local` | **PASS** | DB + Prisma schema sync |
| `pnpm verify:local` | **PASS** | api-health, api-ready, web |
| `pnpm --filter @wtp/api typecheck` | **PASS** | After API compile fixes |
| `pnpm typecheck` (workspace) | **FAIL** | Web: unused vars, missing Jest types in spec |
| `pnpm lint` (workspace) | **FAIL** | ~210 API lint issues + web lint issues (mostly pre-existing) |
| `pnpm test:mvp-acceptance` | **FAIL** | 2 passed, 1 failed (policy evaluate returns 400) — **unchanged after UI commits** |
| `pnpm --filter @wtp/web exec tsc --noEmit` | **PASS** | After `3a9ac35` |

### MVP acceptance e2e detail (`mvp-acceptance.e2e-spec.ts`)

| Test | Result |
|------|--------|
| 1 — org and dashboard summary available | **PASS** |
| 2 — policy evaluate endpoint responds | **FAIL** (expected 200/201, received 400) |
| 5 — audit events query returns array | **PASS** |

Failure context for test #2: `POST /v1/policy/evaluate` returned HTTP 400 during acceptance run (likely validation/payload fixture mismatch — wallet/member/policy seed incomplete in test path).

### Core flow coverage (manual / partial)

| Flow | Local status |
|------|----------------|
| Auth + org creation (via e2e) | Exercised in acceptance tests |
| Dashboard summary | PASS in acceptance test |
| Policy evaluation API | Endpoint reachable; acceptance payload fails validation |
| Approval workflow | Not fully verified in this run |
| Audit log query | PASS in acceptance test |
| Safe connect / Sepolia signing | Not run (requires real RPC keys) |

---

## Phase D — MVP gap analysis (PRD §19)

| # | Criterion | Status | Evidence | Missing / next action |
|---|-----------|--------|----------|------------------------|
| 1 | Connect Safe on Sepolia + $2K/day marketing policy | **Not tested** | No Safe e2e in this run | Real `ETH_RPC_URL_SEPOLIA`; automate Safe connect |
| 2 | Marketing $1.5K auto-allow under $2K/day | **Partial / fail** | `test:mvp-acceptance` #2 → 400 | Fix test fixture + seeded wallet/policy data |
| 3 | $8K intent → 2 approvals | **Partial** | Docs/tests exist; not green in suite | Repair dual-approval e2e |
| 4 | Contractor temp access expires → deny | **Partial** | `contractor-deploy.e2e` in repo | Include in green acceptance workflow |
| 5 | Audit CSV export non-empty | **Partial** | Audit query passes; export not re-run | Stabilize `audit-export.e2e` in suite |
| 6 | No critical/high vulns (pen test) | **Not tested** | Out of local scope | Schedule pen test + SAST |
| 7 | 99.5% uptime (30-day beta) | **Not testable** | Needs production soak | Staging SLO monitoring |

---

## Phase E — Documentation

| File | Purpose |
|------|---------|
| `docs/local-mvp-validation-report.md` | Concise validation snapshot + matrix |
| `docs/mvp-acceptance-checklist.md` | Added local `verify:local` checklist section |
| `README.md` | Link to validation report; bootstrap uses `db:push` |
| `docs/mvp-run-execution-report.md` | This full execution report |

**Commit:** `39bba64` — `docs(mvp): add local validation report and acceptance matrix`

---

## Phase F — UI unification and MVP regression verification (2026-05-21)

### UI commits (presentation only)

| Hash | Message | Scope |
|------|---------|--------|
| `010e8da` | `feat(web): redesign MVP UI for client-ready dashboard experience` | Auth + dashboard shell, partial page polish |
| `3a9ac35` | `feat(web): unify dashboard UI on shared design system` | All dashboard pages + shared `Modal`, `Drawer`, `Input`, `PageHeader`, etc. |

**Scope confirmation:** `git diff` from `010e8da` through `3a9ac35` shows changes under `apps/web` only. No API, policy engine, or database changes.

### Regression verification (no side effects on MVP features)

| Area | Method | Result |
|------|--------|--------|
| Backend behavior | Re-run `pnpm test:mvp-acceptance` with Docker DB/Redis up | **2 pass, 1 fail** — identical to pre-UI baseline (test #2: `POST /v1/policy/evaluate` → 400 with placeholder `walletId`) |
| Web compile | `pnpm --filter @wtp/web exec tsc --noEmit` | **PASS** |
| API integration in UI | Static review of component handlers | All MVP flows still call the same `@/lib/api/*` functions with the same payloads |
| Automation hooks | Grep `data-testid` / `aria-label` | Policy form test IDs and approval `aria-label`s preserved |
| Playwright copy | Compare e2e specs to `PageHeader` titles | `Approvals`, `New USDC transfer` headings unchanged |

### MVP flows — functional parity checklist

| MVP flow | UI surface | Regression status |
|----------|------------|-------------------|
| Org / team invite | `InviteMemberModal` → `inviteMember()` | OK — same API; submit via `form` + `type="submit"` |
| Role assignment / temp access | `RoleAssignmentForm`, `TemporaryAccessFields` | OK — same `assignRole()` args |
| Policy edit ($2K/day, approvers) | `PolicyForm` + rule fields | OK — same `buildRules()` / `onSubmit`; test IDs intact |
| Safe connect | `ConnectSafeForm` | OK — same challenge/sign/verify sequence |
| Intent wizard | `CreateIntentWizard` | OK — same `evaluatePolicy` / `createIntent` payloads and step gating |
| Approvals inbox | `ApprovalActions`, `ConfirmApprovalModal` | OK — same `decideApproval()`; note field now controlled (improvement) |
| Audit log + export | `AuditPage`, `AuditFilters` | OK — same filter state + `startAuditExport()` |
| API keys | `CreateApiKeyModal`, revoke | OK — same `createApiKey` / `revokeApiKey` |

### Conclusion

The UI unification is **cosmetic and structural (components/layout)**. It does **not** change MVP business logic, API contracts, or acceptance-test outcomes. Remaining MVP gaps (criterion #2 fixture, Safe e2e, lint debt) pre-date this UI pass.

---

## Code fixes applied (runtime blockers)

### NestJS modules

- `apps/api/src/policy/policy.module.ts` — `forwardRef(() => RolesModule)`
- `apps/api/src/intent/intent.module.ts` — `forwardRef(() => PolicyModule)`
- `apps/api/src/auth/auth.module.ts` — register and export `JwtAuthGuard`

### TypeScript / compile

- `apps/api/src/org/org.controller.ts` — renamed injected service (`dashboardSummary`) to avoid duplicate identifier with route method
- `apps/api/src/intent/intent.mapper.ts` — safe cast for `policyDecisionJson`
- `apps/api/src/auth/auth.service.spec.ts` — MFA-aware login assertion
- `apps/api/src/policy/policy-evaluation.service.spec.ts` — added `MetricsService` mock (4th ctor arg)
- `apps/api/tsconfig.json` — dist path aliases, DOM lib for viem/ox types

### Package resolution

- `packages/shared/package.json` — `exports` for subpath imports (`@wtp/shared/policy/*`)
- `packages/policy-engine/tsconfig.json` — paths to shared `dist` for build

---

## Commits (execution order)

| Order | Hash | Message | Purpose | Verified |
|-------|------|---------|---------|----------|
| 1 | `cf281a9` | `chore(devx): add deterministic local setup and smoke verification` | Scripts + docs for bootstrap/verify | Scripts added |
| 2 | `a9e12f7` | `fix(local): unblock API startup and schema bootstrap flow` | Runtime + schema + module fixes | `setup:local`, API health, `verify:local` |
| 3 | `39bba64` | `docs(mvp): add local validation report and acceptance matrix` | Gap matrix + checklist | Report files created |
| 4 | `010e8da` | `feat(web): redesign MVP UI for client-ready dashboard experience` | Design system + auth/dashboard shell | Web renders; no API diff |
| 5 | `3a9ac35` | `feat(web): unify dashboard UI on shared design system` | Full dashboard UI consistency | `tsc` pass; MVP acceptance unchanged |

**Branch status:** `main` ahead of `origin/main` by 5 commits (not pushed per instructions).

---

## Reproduce this run

```bash
# Prerequisites: Node 20+, pnpm 9+, Docker Desktop running

pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

pnpm setup:local

# Terminal 1
pnpm --filter @wtp/api dev

# Terminal 2
pnpm --filter @wtp/web dev

# Terminal 3 — smoke check
pnpm verify:local

# Optional — readiness gates
pnpm test:mvp-acceptance
pnpm typecheck
pnpm lint
```

### Required local env (minimum)

**API (`apps/api/.env`):**

- `DATABASE_URL` — required
- `JWT_ACCESS_SECRET` — required for auth
- `REDIS_URL` — required for workers (optional for core API boot)

**Optional for full MVP scenarios:**

- `ETH_RPC_URL_SEPOLIA`, `ETH_RPC_URL_MAINNET` — Safe/RPC flows
- `COINGECKO_API_KEY` — USD policy evaluation without fail-closed deny

**Web (`apps/web/.env`):**

- `NEXT_PUBLIC_API_URL=http://localhost:3001/v1`

---

## Recommended next steps

1. Fix `mvp-acceptance.e2e-spec.ts` criterion #2 (policy evaluate 400) — seed wallet + marketing policy in test setup.
2. Add green e2e for criteria #1 and #3 (Safe connect, dual approval) with documented RPC fixture strategy.
3. Triage workspace `lint` / `typecheck` debt or scope CI to packages that must pass for MVP gate.
4. Reorder or squash-fix Prisma migrations so `migrate deploy` works on fresh DB (production parity).
5. Run security scan + staging soak before claiming criteria #6 and #7.

---

## Related files

- [local-mvp-validation-report.md](./local-mvp-validation-report.md) — short validation snapshot
- [mvp-acceptance-checklist.md](./mvp-acceptance-checklist.md) — PRD §19 sign-off checklist
- [../README.md](../README.md) — local development instructions

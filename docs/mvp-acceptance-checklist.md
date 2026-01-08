# MVP acceptance checklist (PRD §19)

Sign-off before production launch.

| # | Criterion | Automated | Owner | Date |
|---|-----------|-----------|-------|------|
| 1 | Connect Safe on Sepolia | Manual / Playwright | | |
| 2 | Marketing $2K policy → $1.5K auto-allow | `mvp-acceptance.e2e` partial | | |
| 3 | $8K intent → 2 approvals | E2E / manual | | |
| 4 | Contractor temp access expires → deny | `contractor-deploy.e2e` | | |
| 5 | Audit CSV export non-empty | `audit-export.e2e` | | |

Run automated suite:

```bash
pnpm test:mvp-acceptance
```

## Local working-product verification checklist

Run these while API and web dev servers are running:

```bash
pnpm verify:local
```

Expected:

- `PASS api-health`
- `PASS api-ready`
- `PASS web`
- `Local verification passed.`

Latest execution evidence is tracked in `docs/local-mvp-validation-report.md`.

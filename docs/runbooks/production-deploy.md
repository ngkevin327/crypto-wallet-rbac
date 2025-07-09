# Production deployment

## Prerequisites

- AWS credentials with deploy role
- `terraform >= 1.5`, `docker`, `pnpm`
- Git tag `v*` triggers `.github/workflows/deploy-production.yml`
- GitHub Environment **production** requires manual approval

## Deploy steps

1. Merge release branch to `main` and verify CI green.
2. Create annotated tag: `git tag -a v0.1.0 -m "Release 0.1.0"` && `git push origin v0.1.0`.
3. Approve the **production** environment job in GitHub Actions.
4. Workflow builds API + worker images, pushes to ECR, runs `terraform apply`.
5. Confirm smoke test passes on `GET /v1/health`.
6. Run `pnpm test:mvp-acceptance` against production (optional gate).

## Secrets rotation

| Secret | Location | Rotation |
|--------|----------|----------|
| `JWT_ACCESS_SECRET` | Secrets Manager | Quarterly; invalidate sessions |
| `DATABASE_URL` | Secrets Manager | On credential rotation via RDS |
| API keys (customer) | App UI | Customer-managed |

## Pre-migration checklist

- [ ] RDS snapshot: `aws rds create-db-snapshot --db-instance-identifier wtp-production-postgres`
- [ ] Notify on-call channel
- [ ] Verify rollback task definition revision saved

## Post-deploy

- Watch 5xx rate and queue depth dashboards (see `infra/monitoring/`)
- Scan audit log for elevated `intent.failed` events

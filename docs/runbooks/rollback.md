# Rollback procedures

## ECS API rollback (fast)

1. Open ECS console → cluster `wtp-production-cluster` → service `wtp-production-api`.
2. Deployments → select previous **task definition revision**.
3. Update service to previous revision; wait for steady state (2 healthy tasks).
4. Run smoke: `curl -fsS https://api.wtp.example.com/v1/health`.

## Worker rollback

Repeat for `wtp-production-worker` service. Ensure worker image tag matches API release.

## Terraform rollback

If infrastructure change caused regression:

```bash
cd infra/environments/production
terraform plan -target=module.ecs  # review
git checkout <previous-tag> -- infra/
terraform apply
```

## Database migrations

- **Forward-only** migrations in production. If migration failed mid-way, restore RDS snapshot taken pre-deploy (see `production-deploy.md`).
- Never run `prisma migrate reset` in production.

## Communication template

> We rolled back release `vX.Y.Z` to `vX.Y.(Z-1)` at {time} UTC due to {brief reason}. Customer impact: {none / intents delayed}. Monitoring for 30 minutes.

# WTP production infrastructure

Terraform modules for Wallet Team Permissions on AWS.

## Layout

- `modules/vpc` — VPC, public/private subnets, NAT gateway
- `modules/rds` — PostgreSQL 15 in private subnets
- `modules/elasticache` — Redis for BullMQ and rate counters
- `modules/ecs` — Fargate API and worker services
- `modules/alb` — HTTPS load balancer for API
- `modules/dns` — ACM certificate and Route53 alias
- `environments/staging` — smaller footprint for pre-prod
- `environments/production` — full stack with ALB and DNS

## Usage

```bash
cd infra/environments/staging
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply
```

Sensitive outputs (`database_url`, `redis_url`) should be stored in AWS Secrets Manager and referenced by ECS task definitions.

## Networking

- ECS tasks run in **private subnets** with outbound internet via NAT (Safe TX API, CoinGecko).
- RDS and ElastiCache accept traffic only from ECS security groups.

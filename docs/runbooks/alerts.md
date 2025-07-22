# Alert runbook index

| Alarm | Threshold | Runbook |
|-------|-------------|---------|
| `wtp-api-5xx-rate` | >10 5xx / 5m | Check ECS logs, recent deploy, rollback if needed (`rollback.md`) |
| `wtp-queue-backlog` | >100 messages / 10m | Inspect BullMQ workers, Redis connectivity (`stuck-intents.md`) |

PagerDuty receives SNS notifications from CloudWatch in production.

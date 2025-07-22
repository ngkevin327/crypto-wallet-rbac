# On-call playbook

## Severity definitions

| Level | Examples | Response |
|-------|----------|----------|
| **Sev1** | API down, auth broken, funds at risk | Page immediately, all-hands until mitigated |
| **Sev2** | Elevated 5xx, approvals stuck, Safe API degraded | Page on-call engineer within 15 minutes |

## Escalation

1. On-call engineer (primary)
2. Engineering lead
3. Founder (business communication)

## Communication template (customer-facing)

> We are investigating elevated errors affecting transfer intents. New submissions may be delayed. We will update within 30 minutes.

## Related runbooks

- [Production deploy](production-deploy.md)
- [Rollback](rollback.md)
- [Stuck intents](stuck-intents.md)
- [Safe API outage](safe-api-outage.md)
- [Alerts](alerts.md)

## Contact placeholder

| Role | Contact |
|------|---------|
| Primary on-call | oncall@example.com |
| Escalation | founder@example.com |

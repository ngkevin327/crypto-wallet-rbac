# Safe API outage runbook

## When to use

- Safe Transaction Service returns 503/429 for all propose/status calls
- Spike in `intent.failed` audit events with `safe_api_*` reasons

## Immediate actions

1. Pause new propose operations (feature flag or maintenance banner in web app)
2. Notify org admins via status page template:

   > Safe Transaction Service is degraded. New proposals are queued; signing may be delayed.

3. Existing `submitted` intents: tx-status worker will retry while errors are classified retryable

## Recovery

1. Confirm Safe status page / health endpoint
2. Resume propose endpoint
3. Drain tx-status queue; verify intents transition to `executed` or `failed`

## Post-incident

- Export audit events `intent.failed` and `intent.submitted` for the outage window
- Document root cause and duration in incident log

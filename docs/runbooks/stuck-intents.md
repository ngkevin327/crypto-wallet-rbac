# Stuck intents runbook

## Symptoms

- Intent remains in `submitted` for more than 30 minutes
- Safe Transaction Service shows `AWAITING_CONFIRMATIONS` but on-chain tx never executes

## Investigation

1. Fetch intent by id: `GET /v1/intents/:id`
2. Note `safe_tx_hash` and `status`
3. Query Safe TX API for multisig transaction status (Sepolia base URL from `SAFE_TX_SERVICE_URL_SEPOLIA`)
4. Check worker `tx-status` queue depth in Redis/BullMQ

## Remediation

1. Manually poll Safe API; if `EXECUTED`, update intent via admin script or re-run tx-status job
2. If Safe API returns `FAILED`, set intent `failed` with `failure_reason` from API body
3. If quorum never collected, verify owners signed via Safe UI

## Cancel

- Intents in `pending_approval` or `ready_to_sign` may be cancelled by org admin (future endpoint)
- Do not delete rows; transition to `cancelled` for audit trail

## SQL (read-only)

```sql
SELECT id, status, safe_tx_hash, tx_hash, failure_reason, updated_at
FROM transaction_intents
WHERE status = 'submitted' AND updated_at < NOW() - INTERVAL '30 minutes';
```

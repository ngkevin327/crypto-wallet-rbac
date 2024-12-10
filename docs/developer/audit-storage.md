# Audit event storage

Audit events are append-only rows in `audit_events`. Each row includes a logical **partition key** (`YYYY-MM`) derived from `created_at` for monthly retention and export boundaries.

## Indexes

- `(organization_id, created_at DESC)` — org timeline queries
- `(organization_id, event_type, created_at DESC)` — filtered queries
- `(partition_key, created_at DESC)` — partition-scoped maintenance

## Export

- **Sync CSV** (`GET /v1/orgs/:orgId/audit/export.csv`): up to 5,000 rows; returns `413` with async hint above threshold.
- **Async export** (`POST /v1/orgs/:orgId/audit/export`): worker writes CSV to S3 `audit-exports/{orgId}/{jobId}.csv`; presigned URL via `GET /v1/audit/export-jobs/:id` (7-day TTL).

Partition keys are set on insert in `AuditService.append()`; they are not updated after creation.

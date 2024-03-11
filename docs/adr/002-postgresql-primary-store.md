# ADR-002: PostgreSQL as primary data store

## Status

Accepted

## Context

The domain is relational: organizations, members, roles, policies, intents, approvals, and append-only audit events. JSON policy rules need structured querying and versioning.

## Decision

Use **PostgreSQL 15+** as the system of record with **Prisma** for schema migrations and type-safe access.

Redis is used for ephemeral data only: rate counters, session cache, idempotency keys, and job queues—not authoritative business state.

## Consequences

**Positive**

- ACID transactions for intent + approval workflows
- Mature tooling for backups, replication, and reporting
- JSONB for policy rules with indexed metadata columns

**Negative**

- Horizontal write scaling limited to single primary (read replicas acceptable)
- Migration discipline required for zero-downtime deploys

## Notes

Audit events may be partitioned by month at scale. No user private keys are stored in any table.

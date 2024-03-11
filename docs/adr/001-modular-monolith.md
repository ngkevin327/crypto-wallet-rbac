# ADR-001: Modular monolith for MVP

## Status

Accepted

## Context

Wallet Team Permissions must ship an MVP in roughly five months with a small team. The product spans auth, org management, policy evaluation, Safe integration, approvals, and audit logging.

## Decision

Build a **modular monolith** in `apps/api` with clear module boundaries (auth, org, wallet, policy, intent, approval, audit). Background work runs in a separate worker process sharing the same codebase and database.

Extract services (e.g. dedicated policy evaluator deployment) only when metrics or team boundaries require it.

## Consequences

**Positive**

- Faster delivery and simpler local development
- Single deployment artifact for API + shared domain logic
- Transactions across modules remain straightforward

**Negative**

- All modules scale together until split
- Discipline required to avoid circular imports and blurred boundaries

## Compliance

Review module boundaries each quarter. If policy evaluation CPU exceeds 40% of API fleet cost, revisit extraction per ADR-004.

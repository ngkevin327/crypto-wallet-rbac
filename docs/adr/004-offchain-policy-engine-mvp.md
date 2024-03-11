# ADR-004: Offchain policy engine for MVP

## Status

Accepted

## Context

Policies include USD limits, token allowlists, hourly transaction counts, and approval thresholds. Onchain enforcement would require custom contracts and slower iteration.

## Decision

Evaluate policies **offchain** in a pure TypeScript package (`@wtp/policy-engine`) invoked by the API before any Safe transaction is proposed.

Rules:

- **Fail closed** if price oracle is unavailable
- **Most restrictive merge** when multiple roles apply
- Persist policy version and decision snapshot on each intent for audit replay

Onchain policy modules are a post-MVP option for customers requiring trustless enforcement.

## Consequences

**Positive**

- Rapid policy changes without contract deploys
- Unit-testable evaluator with high coverage target

**Negative**

- Determined attacker with raw keys could bypass WTP (mitigate via ops process and future monitoring)
- Requires accurate USD pricing for limit rules

## Performance target

Policy evaluation p95 &lt; 500ms including Redis counter reads.

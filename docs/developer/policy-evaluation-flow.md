# Policy evaluation flow

```mermaid
sequenceDiagram
  participant Web
  participant API
  participant Oracle
  participant Redis
  participant Engine

  Web->>API: POST /v1/policy/evaluate
  API->>API: Resolve member role assignments
  API->>API: Load active policies
  API->>Oracle: getUsdPrice(token)
  alt oracle failure
    Oracle-->>API: PriceUnavailableError
    API-->>Web: DENY (fail-closed)
  else price ok
    API->>Redis: getCounters(member)
    API->>Engine: evaluate(context, rules)
    Engine-->>API: PolicyDecision
    API-->>Web: ALLOW | DENY | REQUIRE_APPROVAL
  end
```

## Merge strategy

The `@wtp/policy-engine` package evaluates each rule, then merges:

1. Any **DENY** → final **DENY**
2. Else any **REQUIRE_APPROVAL** → final **REQUIRE_APPROVAL** (highest `approverCount` wins)
3. Else **ALLOW**

## Dry-run vs intent

`POST /v1/policy/evaluate` is a dry-run preview. Persisted intents (Stage 4) reuse the same evaluation path before submission.

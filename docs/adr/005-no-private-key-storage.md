# ADR-005: No private key storage

## Status

Accepted

## Context

WTP is a permissions and approval layer, not a custodian. Storing private keys would change regulatory posture and breach customer trust.

## Decision

The platform **must not**:

- Generate wallet seed phrases or private keys for customer treasuries
- Persist private keys, mnemonics, or unencrypted signing material
- Transmit keys through application logs or support channels

Signing happens via the user’s wallet (e.g. MetaMask) or existing Safe signer flows. API keys authenticate bots to **policy-bound intents**, not raw signing authority over master keys.

## Consequences

**Positive**

- Clear security story for customers and auditors
- Reduced blast radius if application databases are compromised

**Negative**

- UX depends on wallet connect and Safe signer availability
- Bots cannot sign unless integrated with approved signing infrastructure

## Implementation checks

- Code review checklist includes key-material grep
- Penetration test scope excludes custodial assumptions

# ADR-003: Safe-first wallet integration

## Status

Accepted

## Context

Target customers (crypto startups, DAO ops teams) predominantly use Gnosis Safe for treasury multisigs. MVP must connect, verify signers, and propose transactions without building a new wallet.

## Decision

Implement the **wallet adapter pattern** with **Gnosis Safe** as the first adapter:

- Validate Safe contract via RPC
- Sync owners and threshold periodically
- Propose and track transactions via Safe Transaction Service API
- Never store or generate private keys

Solana multisig and MPC adapters are deferred post-MVP.

## Consequences

**Positive**

- Matches customer wallets in production
- Clear integration surface for future adapters

**Negative**

- Safe API availability and rate limits become operational dependencies
- Users can still sign outside WTP via Safe UI (monitoring gap until reconciliation ships)

## Verification

Signer proof uses EIP-712 message signing; recovered address must be in the Safe owner set at connection time.

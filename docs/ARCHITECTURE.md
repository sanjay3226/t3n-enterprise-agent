# Architecture Specification: T3N-AuditShield

## Overview
T3N-AuditShield is an autonomous compliance agent designed to process sensitive enterprise records within Terminal 3 Network (T3N) confidential computing enclaves.

The system addresses the compliance and privacy risks of passing raw personally identifiable information (PII) directly to LLMs or external services by handling sanitization and verification inside hardware-isolated enclaves.

## Architecture

```
Enterprise Client (ERP / FinTech Backend / LLM Pipeline)
                      │
                      ▼ (Encrypted Session over TLS)
┌─────────────────────────────────────────────────────────┐
│ T3N-AuditShield Agent                                   │
│                                                         │
│ 1. Identity Layer: Validates canonical did:t3n DIDs     │
│ 2. Delegation Gateway: Enforces scoped permissions      │
│ 3. Enclave Runtime: Runs zero-knowledge PII checks     │
│ 4. Verification Engine: Checks Smart VCs & KYC status  │
│ 5. Telemetry Service: /healthz and /metrics endpoints   │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼ (Mutual Session Handshake)
Terminal 3 Network (Intel TDX Confidential Enclave)
```

## Security Model

1. **Hardware Enclave Isolation**: All cryptographic operations and session handshakes run inside Intel TDX enclaves, verified against T3N trust anchors.
2. **Zero-Knowledge Sanitization**: Sensitive identifiers (SSN, Tax ID) are converted into deterministic pseudonyms (`did:t3n:anon:<hash>`). Business rules (income thresholds, credit scores) are evaluated in-enclave without exposing raw fields.
3. **Scoped Member Delegation**: The agent checks explicit permissions (`audit:pii`, `audit:credentials`, `audit:receipts`) before executing operations.
4. **Audit Digests**: Every action produces a deterministic SHA-256 hash containing execution metadata and timestamps for audit logs.

## Module Breakdown

- `src/config/t3n.ts`: Loads WASM component, verifies trust anchor, authenticates session.
- `src/core/auth.ts`: Validates DID string syntax and derives agent identities.
- `src/core/delegation.ts`: Enforces rate limits and permitted method lists per scope.
- `src/core/auditEngine.ts`: Core processing logic for records, VCs, and receipts.
- `src/health.ts`: Exposes `/healthz` and `/metrics` for container orchestrators.
- `src/agent.ts`: CLI entrypoint executing test scenarios against testnet.

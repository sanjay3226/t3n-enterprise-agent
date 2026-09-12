# T3N Enterprise Agent Submission

- **Challenge:** Try out new docs to build a trusted agent with T3N that we can distribute / host
- **Sponsor:** Terminal 3 Network (T3N)
- **Participant DID:** `did:t3n:1142e6fe4b46cda878b5aedcc32fad8c3a979384`
- **GitHub Repository:** `https://github.com/<username>/t3n-enterprise-agent`

---

## 1. Overview & Enterprise Use Case

**T3N-AuditShield** is a compliance and data privacy agent designed for enterprises that need to process sensitive customer data without exposing raw PII to LLMs, external APIs, or cloud loggers.

### The Problem
Enterprises managing personal customer records (SSNs, Tax IDs, financial balances) face strict regulatory requirements (GDPR, CCPA). Sending raw records directly to third-party AI models or agents creates compliance and data leakage risks.

### The Solution with T3N
Using Terminal 3 Network's confidential computing enclaves (Intel TDX) and decentralized identity (DID):
1. **In-Enclave PII Sanitization**: Raw records are ingested and evaluated inside the hardware enclave. Only a deterministic pseudonym DID (`did:t3n:anon:<hash>`) and a boolean compliance verdict are emitted.
2. **Smart Verifiable Credential (VC) Checks**: Validates caller DIDs and credentials against on-chain registries.
3. **Tamper-Evident Receipts**: Generates deterministic SHA-256 digests for corporate compliance logs.

---

## 2. Maintenance & Handover Process

### Program Preference:
We would like to continue running and maintaining this agent through the **Terminal 3 Startup Program and ecosystem listing page**.

### Handover Readiness:
For direct hosting by the Terminal 3 team, the repository includes:
- A production `Dockerfile` and `docker-compose.yml` for 1-command startup.
- A built-in HTTP health and telemetry service (`/healthz` and `/metrics` on port 3000) for Kubernetes or Docker monitoring.
- An operational runbook in `docs/HANDOVER.md`.

Quick deployment command:
```bash
git clone https://github.com/<username>/t3n-enterprise-agent.git
cd t3n-enterprise-agent
docker compose up -d
curl http://localhost:3000/healthz
```

---

## 3. Execution Verification & Logs

Tested against the live T3N testnet enclave using our claimed Tenant DID:

```
[t3n-agent] Initializing session on testnet...
[t3n-agent] Authenticated in 1123ms
[t3n-agent] Tenant DID: did:t3n:1142e6fe4b46cda878b5aedcc32fad8c3a979384
[t3n-agent] Eth Address: 0x48194316e6b6d97f01ce60b6f7707220b95ca350
[t3n-agent] Identity verified: T3N Enterprise Auditor (compliance_worker)

[task 1/3] Processing customer record with PII sanitization...
[task 1/3] Result: PASSED | Eligible: true
[task 1/3] Pseudonym DID: did:t3n:anon:d894b2d94826ed1a9a20ff8b90a69d9c
[task 1/3] Audit Hash: 0x97b7802177987f937ae6e652be313ad11fc70a1d42afcb42c93426e18ad8a992

[task 2/3] Verifying Smart Verifiable Credential...
[task 2/3] Credential: EnterpriseComplianceCertificate_v2 | Valid: true
[task 2/3] KYC: Level_2_Verified | Sig: 0xb392aaae4185b065b07f1c...

[task 3/3] Generating tamper-evident audit receipt...
[task 3/3] Receipt ID: rcpt_2ad9b848991c
[task 3/3] Digest: 0xa8d7faaef8246e34dd0e35663c74b6c4e2ac143bffd18d736c8be50bef27c5fb

[t3n-agent] All agent tasks completed successfully.
```

---

## 4. Refreshed Docs Feedback & Bug Report

1. **Windows Subshell PATH Resolution during `npm install`**:
   - `npm install @terminal3/t3n-sdk@5.2.0 tsx` can fail during esbuild postinstall if the child `cmd.exe` process hasn't inherited Node.js from the environment PATH. Adding a small note for Windows devs in the prerequisites would prevent this.
2. **Single-Display API Key Modal**:
   - The claim page modal only shows the private API key once. Adding a copy-confirmation prompt or a one-time `.env` download would prevent accidental loss.
3. **Trust Anchor Manifest Caching**:
   - Calling `await fetchTrustedManifest("testnet")` on each client construction adds remote network latency. The docs should show how to cache the manifest object with an in-memory TTL for production microservices.
4. **DID vs. Address Clarification**:
   - A brief note clarifying that the derived Ethereum address is used solely for the initial handshake signature, while `tenantDid` is the permanent identifier across all T3N contracts.

---

## 5. Documentation Links in Repo
- Architecture: `docs/ARCHITECTURE.md`
- Handover Runbook: `docs/HANDOVER.md`
- Bug Report: `docs/BUG_REPORT.md`

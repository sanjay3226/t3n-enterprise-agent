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
- An automated GitHub Actions CI workflow (`.github/workflows/ci.yml`) testing against Node 18, 20, and 22.
- A complete unit test suite (`npm test`) with 100% pass rate across 8 test suites.
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

### Agent Execution against Live T3N Testnet Enclave:
```
[t3n-agent] Connecting to T3N confidential enclave...
[t3n-agent] Connected in 1184ms
[t3n-agent] Environment:     testnet
[t3n-agent] Tenant DID:      did:t3n:1142e6fe4b46cda878b5aedcc32fad8c3a979384
[t3n-agent] Signing Address: 0x48194316e6b6d97f01ce60b6f7707220b95ca350
[t3n-agent] Enclave Trust:   Manifest v1 (3 peers attested)
[t3n-agent] Identity:        T3N Enterprise Auditor (compliance_worker)

[task:pii] Running zero-knowledge customer record evaluation...
[task:pii] Ingested record:   REC-CORP-98421 (SSN: [REDACTED IN TEE])
[task:pii] Derived Pseudonym: did:t3n:anon:d894b2d94826ed1a9a20ff8b90a69d9c
[task:pii] Compliance Status: PASSED (Eligible: true)
[task:pii] Audit Digest:      0x34293f06e2cfcf2b5a19c1187d9a1fc65ba79093b1eb8beeb1593c6be5371307

[task:vc] Validating Smart Verifiable Credential on-chain...
[task:vc] Holder DID:         did:t3n:7821bc34ef918234ab871234cd982341fe654321
[task:vc] Credential Type:    EnterpriseComplianceCertificate_v2
[task:vc] Status:             VALID (Level_2_Verified)
[task:vc] Enclave Signature:  0xd1b42784cf130541cf071665cb3335...

[task:receipt] Minting tamper-evident execution receipt...
[task:receipt] Receipt ID:    rcpt_c28723c0b11a
[task:receipt] Cryptographic: 0x4f7f6311894d84f8ee27786ef7174dbfa3e2ad6f0ba820875e5da4815a51cf1c
[task:receipt] Timestamp:     2026-09-12T12:15:30.120Z

[t3n-agent] Run completed successfully with 0 errors.
```

### Automated Unit & Integration Test Suite (`npm test`):
```
> t3n-enterprise-agent@1.0.0 test
> tsx --test test/agent.test.ts

✔ DID syntax verification (0.99ms)
✔ Identity resolution (0.14ms)
✔ Delegation scope enforcement (0.53ms)
✔ Confidential PII sanitization and credit evaluation (1.59ms)
✔ Underwriting rejection logic (0.19ms)
✔ Smart VC verification proof (0.18ms)
✔ Tamper-evident audit receipt minting (0.35ms)
✔ Health server liveness and metrics probes (1194ms)
ℹ tests 8
ℹ pass 8
ℹ fail 0
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

# T3N-AuditShield

Privacy-preserving compliance and data audit agent for enterprise systems, built on the Terminal 3 Network (T3N).

The agent audits sensitive customer records, sanitizes PII, and verifies Smart Verifiable Credentials (VCs) inside hardware-attested Trusted Execution Environments (TEEs), avoiding raw data exposure to LLMs or external cloud services.

## Features

- **Intel TDX Enclave Attestation**: Validates node image measurements against T3N trust anchors.
- **Zero-Knowledge PII Sanitization**: Evaluates credit/compliance criteria in-enclave and outputs deterministic pseudonym DIDs (`did:t3n:anon:<hash>`).
- **Smart VC Verification**: Validates caller DIDs and credentials against T3N on-chain registries.
- **Tamper-Evident Receipts**: Generates cryptographic execution digests for corporate compliance logs.
- **Production Telemetry**: Built-in HTTP health and metrics endpoints (`/healthz`, `/metrics`).

## Quickstart

### Prerequisites
- Node.js >= 18.0.0
- T3N API key (claimed from `go.terminal3.io/adk-community`)

### Setup

1. Clone and install dependencies:
   ```bash
   git clone https://github.com/<username>/t3n-enterprise-agent.git
   cd t3n-enterprise-agent
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```
   Set your `T3N_API_KEY` and `T3N_TENANT_DID`.

3. Run the agent:
   ```bash
   npm start
   ```

4. Run the health daemon:
   ```bash
   npm run health
   # Listening on http://localhost:3000/healthz
   ```

## Docker Deployment

```bash
docker compose up -d
curl http://localhost:3000/healthz
```

## Project Structure

```
t3n-enterprise-agent/
├── src/
│   ├── config/t3n.ts         # T3nClient initialization and trust anchor setup
│   ├── core/auth.ts          # DID format validation and identity checks
│   ├── core/delegation.ts    # Member delegation scope checks
│   ├── core/auditEngine.ts   # PII sanitization and VC verification logic
│   ├── agent.ts              # Main CLI execution flow
│   └── health.ts             # Health check probe (/healthz, /metrics)
├── docs/
│   ├── ARCHITECTURE.md       # Architecture spec and security model
│   ├── HANDOVER.md           # Handover runbook for T3N hosting
│   └── BUG_REPORT.md         # Docs feedback and friction report
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Documentation

- [Architecture Specification](docs/ARCHITECTURE.md)
- [Handover Runbook](docs/HANDOVER.md)
- [Refreshed Docs Bug & Friction Report](docs/BUG_REPORT.md)

## License
MIT

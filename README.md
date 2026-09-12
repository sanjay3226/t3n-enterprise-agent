# 🛡️ T3N-AuditShield: Enterprise Compliance & Privacy Guardian Agent

[![T3N ADK](https://img.shields.io/badge/T3N%20ADK-v5.2.0-blue)](https://terminal3.io)
[![Confidential Compute](https://img.shields.io/badge/Intel%20TDX-Hardware%20Enclave-green)](https://docs.terminal3.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**T3N-AuditShield** is an autonomous enterprise compliance and privacy agent built on the **Terminal 3 Network (T3N)**. It empowers organizations to audit sensitive enterprise records, sanitize customer PII, and verify Smart Verifiable Credentials (VCs) inside hardware-attested Trusted Execution Environments (TEEs) without exposing raw data to LLMs or external cloud services.

Built for the **Terminal 3 Network Superteam Challenge**.

---

## 🌟 Key Features

* **Hardware-Attested Confidential Enclaves:** Operates inside Intel TDX enclaves with cryptographic remote attestation via T3N's `TrustAnchor`.
* **Zero-Knowledge PII Sanitization:** Ingests raw customer records (SSN, Tax ID, financial data), validates compliance rules inside the enclave, and outputs deterministic pseudonym DIDs (`did:t3n:anon:<hash>`) with zero raw data exposure.
* **Smart Verifiable Credential (VC) Auditing:** Validates enterprise decentralized identities (DIDs) and cryptographic credentials against on-chain status registries.
* **Tamper-Evident Audit Receipts:** Automatically generates verifiable cryptographic receipts (SHA-256 / Keccak) for immutable corporate audit logs.
* **Turnkey Enterprise Maintenance:** Features a built-in telemetry service (`/healthz` and `/metrics`) and 1-click Docker containerization for effortless hosting by the T3N team.

---

## 🚀 Quickstart

### Prerequisites
* Node.js >= 18.0.0
* T3N API Key (claim test credits at [go.terminal3.io/adk-community](https://go.terminal3.io/adk-community))

### 1. Installation
```bash
git clone https://github.com/<your-username>/t3n-enterprise-agent.git
cd t3n-enterprise-agent
npm install
```

### 2. Configuration
Copy the environment template and set your T3N credentials:
```bash
cp .env.example .env
```
Edit `.env`:
```env
T3N_API_KEY=0x_your_private_api_key_here
T3N_TENANT_DID=did:t3n:your_tenant_did_here
T3N_ENVIRONMENT=testnet
PORT=3000
```

### 3. Run the Enterprise Agent
```bash
npm start
```

### 4. Run Telemetry & Health Probe
```bash
npm run health
# Server listening at http://localhost:3000/healthz
```

---

## 🐳 1-Click Docker Deployment

```bash
docker compose up -d
curl http://localhost:3000/healthz
```

---

## 📂 Project Structure

```
t3n-enterprise-agent/
├── src/
│   ├── config/
│   │   └── t3n.ts            # T3N client initialization & TrustAnchor attestation
│   ├── core/
│   │   ├── auth.ts           # DID validation & cryptographic identity checks
│   │   ├── delegation.ts     # Enterprise member delegation & access scopes
│   │   └── auditEngine.ts    # Confidential PII sanitization & VC verification engine
│   ├── agent.ts              # Main enterprise scenario runner CLI
│   └── health.ts             # Health check & telemetry service (/healthz, /metrics)
├── docs/
│   ├── ARCHITECTURE.md       # Full architecture diagram & security model
│   ├── HANDOVER.md           # Turnkey maintenance & hosting guide for T3N team
│   └── BUG_REPORT.md         # Comprehensive feedback on the refreshed T3N docs
├── Dockerfile                # Production container specification
├── docker-compose.yml        # Multi-container orchestration
└── package.json              # Project dependencies & scripts
```

---

## 📖 In-Depth Documentation

* [Architecture & Security Specification](docs/ARCHITECTURE.md)
* [Turnkey Handover & Maintenance Guide](docs/HANDOVER.md)
* [Refreshed Docs Bug & Friction Report](docs/BUG_REPORT.md)

---

## 📄 License
MIT License. Free for open-source and enterprise use.

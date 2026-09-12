# Enterprise Agent Handover & Operations Runbook

## 1. Hosting Preference Statement

> **Creator Preference:**  
> We would love to **continue running, expanding, and maintaining T3N-AuditShield through the Terminal 3 Startup Program and ecosystem listing page.**  
> However, to ensure maximum enterprise reliability and operational redundancy, this document provides the complete, turnkey handover procedure so the **Terminal 3 Network team can immediately take over, self-host, and distribute the agent.**

---

## 2. Environment Variables Matrix

The agent requires only 3 core environment variables to run in production:

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `T3N_API_KEY` | **Yes** | — | Private hex API key claimed from the T3N portal. |
| `T3N_TENANT_DID` | **Yes** | — | Canonical tenant DID (`did:t3n:<40-hex>`). |
| `T3N_ENVIRONMENT` | No | `testnet` | Target enclave cluster (`testnet` or `production`). |
| `PORT` | No | `3000` | Port for the HTTP `/healthz` and `/metrics` service. |

---

## 3. 1-Click Handover & Deployment Procedure

### Method A: Docker / Container Deployment (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/t3n-enterprise-agent.git
cd t3n-enterprise-agent

# 2. Configure environment
cp .env.example .env
# Edit .env with production T3N credentials

# 3. Build and launch container
docker compose up -d

# 4. Verify health
curl -f http://localhost:3000/healthz
```

### Method B: Bare-Metal Node.js Deployment

```bash
# 1. Prerequisites: Node.js >= 18.0.0
node -v

# 2. Install dependencies
npm ci

# 3. Run enterprise audit agent
npm start

# 4. Run background telemetry daemon
npm run health
```

---

## 4. Monitoring & Telemetry Probes

The agent exposes two dedicated HTTP endpoints for infrastructure monitoring:

* **Liveness & Readiness Probe:** `GET /healthz`  
  Returns HTTP 200 with JSON payload containing `status: "UP"`, active `tenantDid`, `environment`, and uptime. Used for Kubernetes pod health and load balancer routing.
* **Operational Telemetry:** `GET /metrics`  
  Returns memory consumption (`heapUsedMb`, `rssMb`), process ID, and runtime diagnostics.

---

## 5. Maintenance & Upgrades

### Updating the T3N SDK
When Terminal 3 releases new versions of `@terminal3/t3n-sdk`:
```bash
npm install @terminal3/t3n-sdk@latest
npm test
```
The architecture abstracts all SDK imports into `src/config/t3n.ts`, meaning breaking changes or manifest upgrades only need to be adjusted in one single file.

---

## 6. Escalation & Contact
* **Developer Contact:** Discipline Guy & Team
* **DID:** `did:t3n:1142e6fe4b46cda878b5aedcc32fad8c3a979384`
* **Telegram:** Quote Superteam in community chat (`@wardumb`)

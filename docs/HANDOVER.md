# Operations & Handover Guide

## Hosting Preference
We would prefer to continue running and expanding this agent via the Terminal 3 Startup Program and ecosystem listing.

For redundancy or direct distribution by the Terminal 3 team, this guide documents the setup, configuration, and monitoring procedures needed to host it independently.

## Environment Variables

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `T3N_API_KEY` | Yes | — | Hex API key from the claim portal |
| `T3N_TENANT_DID` | Yes | — | Canonical tenant DID (`did:t3n:<40-hex>`) |
| `T3N_ENVIRONMENT` | No | `testnet` | Target enclave cluster (`testnet` / `production`) |
| `PORT` | No | `3000` | Port for the HTTP health server |

## Running the Service

### Docker Compose
```bash
git clone https://github.com/<username>/t3n-enterprise-agent.git
cd t3n-enterprise-agent
cp .env.example .env # populate with API key and DID
docker compose up -d
curl http://localhost:3000/healthz
```

### Node.js Direct
```bash
npm ci
npm start
```

## Monitoring & Health Probes

- **Liveness Probe**: `GET /healthz`  
  Returns JSON status (`status: "UP"`, `tenantDid`, `environment`, `uptimeSec`). Returns HTTP 503 if the session fails.
- **Metrics Probe**: `GET /metrics`  
  Returns memory usage (`heapUsedMb`, `rssMb`) and process PID.

## Updating Dependencies
To update the T3N SDK when newer versions are released:
```bash
npm install @terminal3/t3n-sdk@latest
npm test
```
All SDK instantiation logic is isolated in `src/config/t3n.ts`.

## Contact & DID
- DID: `did:t3n:1142e6fe4b46cda878b5aedcc32fad8c3a979384`
- Support: Telegram community chat (`@wardumb`)

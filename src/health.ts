import http from "node:http";
import { getT3nSession } from "./config/t3n.js";

const PORT = parseInt(process.env.PORT || "3000", 10);

/**
 * Lightweight enterprise health check and telemetry service.
 * Enables zero-downtime monitoring, Kubernetes liveness probes, and ease of maintenance.
 */
export async function startHealthServer() {
  const server = http.createServer(async (req, res) => {
    // 1. Health Probe (/healthz)
    if (req.url === "/healthz" || req.url === "/") {
      try {
        const session = await getT3nSession();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify(
            {
              status: "UP",
              agent: "T3N-AuditShield",
              tenantDid: session.tenantDid,
              environment: session.environment,
              uptimeSeconds: process.uptime(),
              timestamp: new Date().toISOString(),
            },
            null,
            2
          )
        );
      } catch (err: any) {
        res.writeHead(503, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "DOWN", error: err.message }));
      }
      return;
    }

    // 2. Metrics & Telemetry (/metrics)
    if (req.url === "/metrics") {
      const memoryUsage = process.memoryUsage();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify(
          {
            agentName: "T3N-AuditShield",
            heapUsedMb: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
            rssMb: (memoryUsage.rss / 1024 / 1024).toFixed(2),
            pid: process.pid,
            platform: process.platform,
            nodeVersion: process.version,
          },
          null,
          2
        )
      );
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  });

  server.listen(PORT, () => {
    console.log(`[Health Service] Telemetry and Liveness probe listening at http://localhost:${PORT}/healthz`);
  });

  return server;
}

// Direct execution mode
if (process.argv[1]?.endsWith("health.ts") || process.argv[1]?.endsWith("health.js")) {
  startHealthServer().catch((err) => {
    console.error("Failed to start health server:", err);
    process.exit(1);
  });
}

import http from "node:http";
import { getT3nSession } from "./config/t3n.js";

const PORT = parseInt(process.env.PORT || "3000", 10);

export async function startHealthServer() {
  const server = http.createServer(async (req, res) => {
    if (req.url === "/healthz" || req.url === "/") {
      try {
        const session = await getT3nSession();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            status: "UP",
            tenantDid: session.tenantDid,
            environment: session.environment,
            uptimeSec: Math.floor(process.uptime()),
          })
        );
      } catch (err: any) {
        res.writeHead(503, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "DOWN", error: err.message }));
      }
      return;
    }

    if (req.url === "/metrics") {
      const mem = process.memoryUsage();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
          rssMb: Math.round(mem.rss / 1024 / 1024),
          pid: process.pid,
        })
      );
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  });

  server.listen(PORT, () => {
    console.log(`[health] Service listening on port ${PORT}`);
  });

  return server;
}

if (process.argv[1]?.endsWith("health.ts") || process.argv[1]?.endsWith("health.js")) {
  startHealthServer().catch((err) => {
    console.error("[health] Fatal:", err);
    process.exit(1);
  });
}

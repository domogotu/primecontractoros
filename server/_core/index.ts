import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { COOKIE_NAME } from "@shared/const";
import { registerOAuthRoutes } from "./oauth";
import { validateProductionCoreEnv } from "./env";
import { logOwnerBootstrapDiagnostic } from "./ownerBootstrapDiagnostic";
import { getSessionCookieOptions } from "./cookies";
import { secureHeaders, authRateLimit, apiRateLimit, inputSizeLimit } from "../middleware/security";
import { registerStorageProxy } from "./storageProxy";
import { stripeWebhookRouter } from "../stripeWebhook";
import { exportRouter } from "../exportRouter";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { emailScanHandler, webhookRetryHandler } from "../scheduledHandlers";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  validateProductionCoreEnv();

  // Temporary, read-only diagnostic used to identify the freshly-created
  // platform-owner OAuth identity after the production factory reset.
  await logOwnerBootstrapDiagnostic();

  const app = express();
  const server = createServer(app);

  // Render and other production hosts use this endpoint to determine whether
  // the web process itself is alive. Keep it dependency-free so database or
  // third-party incidents do not cause a healthy process to be restarted.
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Fresh-start helper: explicitly clear any old Manus/PrimeContractorOS
  // session left in the browser, then send the user to the normal login page.
  // This is intentionally public because logging out must work even when the
  // current session references a user that was removed during a factory reset.
  app.get("/logout", (req, res) => {
    res.clearCookie(COOKIE_NAME, getSessionCookieOptions(req));
    res.redirect(302, "/login");
  });

  // Security headers
  app.use(secureHeaders);
  // Stripe webhook must be registered BEFORE body parsers (needs raw body)
  app.use(stripeWebhookRouter);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Export/backup routes (after body parsers)
  app.use(exportRouter);
  // Rate limiting on auth endpoints
  app.use("/api/oauth", authRateLimit);
  // API rate limiting
  app.use("/api/trpc", apiRateLimit);
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // Scheduled endpoints (heartbeat cron callbacks)
  app.post("/api/scheduled/email-scan", emailScanHandler);
  app.post("/api/scheduled/webhook-retry", webhookRetryHandler);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const isProduction = process.env.NODE_ENV === "production";
  // In production the hosting provider routes traffic to the exact PORT it
  // assigns. Falling forward to a different port can make the service look
  // deployed while it is unreachable. The fallback scan remains dev-only.
  const port = isProduction ? preferredPort : await findAvailablePort(preferredPort);

  if (!isProduction && port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(error => {
  console.error("Failed to start server:", error);
  process.exitCode = 1;
});

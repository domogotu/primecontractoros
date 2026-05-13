/**
 * Express handlers for /api/scheduled/* endpoints
 * Authenticated via sdk.authenticateRequest (cron identity)
 */
import type { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { runAllEmailScans } from "./services/scheduledEmailScans";
import { retryFailedWebhooks } from "./services/webhookRetry";

export async function emailScanHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!(user as any).isCron) {
      return res.status(403).json({ error: "cron-only" });
    }

    const results = await runAllEmailScans();
    return res.json({
      ok: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Scheduled] Email scan error:", error);
    return res.status(500).json({
      error: error.message || "Email scan failed",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      context: { url: req.url },
      timestamp: new Date().toISOString(),
    });
  }
}

export async function webhookRetryHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!(user as any).isCron) {
      return res.status(403).json({ error: "cron-only" });
    }

    const results = await retryFailedWebhooks();
    return res.json({
      ok: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Scheduled] Webhook retry error:", error);
    return res.status(500).json({
      error: error.message || "Webhook retry failed",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      context: { url: req.url },
      timestamp: new Date().toISOString(),
    });
  }
}

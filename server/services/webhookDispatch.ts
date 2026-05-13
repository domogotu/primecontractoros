/**
 * Outbound webhook dispatch service.
 * Sends HTTP POST to user-registered webhook URLs when events occur.
 * Uses HMAC-SHA256 signing for payload verification.
 */
import crypto from "crypto";
import { getDb } from "../db";
import { webhooks, webhookDeliveries } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

// Supported webhook event types
export const WEBHOOK_EVENTS = [
  "contract.created",
  "contract.updated",
  "contract.status_changed",
  "proposal.created",
  "proposal.submitted",
  "invoice.created",
  "invoice.paid",
  "deadline.approaching",
  "opportunity.created",
  "opportunity.converted",
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENTS)[number];

interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  data: Record<string, unknown>;
}

/**
 * Sign a payload with HMAC-SHA256 using the webhook's secret
 */
function signPayload(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Dispatch a webhook event to all matching subscribers in a workspace.
 * Fire-and-forget: errors are logged but don't propagate.
 */
export async function dispatchWebhookEvent(
  workspaceId: number,
  event: WebhookEventType,
  data: Record<string, unknown>
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    // Find all active webhooks for this workspace that subscribe to this event
    const activeWebhooks = await db
      .select()
      .from(webhooks)
      .where(and(eq(webhooks.workspaceId, workspaceId), eq(webhooks.isActive, true)));

    const matchingWebhooks = activeWebhooks.filter((wh) => {
      try {
        const events: string[] = JSON.parse(wh.events);
        return events.includes(event) || events.includes("*");
      } catch {
        return false;
      }
    });

    if (matchingWebhooks.length === 0) return;

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    const payloadStr = JSON.stringify(payload);

    // Dispatch to all matching webhooks in parallel
    await Promise.allSettled(
      matchingWebhooks.map(async (wh) => {
        const signature = wh.secret ? signPayload(payloadStr, wh.secret) : "";
        let responseStatus = 0;
        let responseBody = "";
        let success = false;

        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

          const response = await fetch(wh.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Webhook-Event": event,
              "X-Webhook-Signature": `sha256=${signature}`,
              "X-Webhook-Timestamp": payload.timestamp,
              "User-Agent": "PrimeContractorOS-Webhook/1.0",
            },
            body: payloadStr,
            signal: controller.signal,
          });

          clearTimeout(timeout);
          responseStatus = response.status;
          responseBody = await response.text().catch(() => "");
          success = response.ok;
        } catch (err: any) {
          responseStatus = 0;
          responseBody = err.message || "Request failed";
          success = false;
        }

        // Log delivery — set nextRetryAt if failed so the retry job picks it up
        const nextRetryAt = !success
          ? new Date(Date.now() + 5 * 60 * 1000) // first retry after 5 min
          : null;
        try {
          await db.insert(webhookDeliveries).values({
            webhookId: wh.id,
            workspaceId,
            eventType: event,
            payload: payloadStr,
            responseStatus,
            responseBody: responseBody.substring(0, 4000),
            success,
            attemptCount: 1,
            nextRetryAt,
          });
        } catch (logErr) {
          console.error("[Webhook] Failed to log delivery:", logErr);
        }
      })
    );
  } catch (err) {
    console.error("[Webhook] Dispatch error:", err);
  }
}

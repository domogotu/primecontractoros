/**
 * Webhook Retry Service
 *
 * Scans for failed webhook deliveries that have not yet exceeded the max retry
 * count and whose nextRetryAt timestamp has passed, then re-attempts delivery
 * with exponential backoff.
 *
 * Backoff schedule (attempt count → delay before next retry):
 *   1 → 5 minutes
 *   2 → 30 minutes
 *   3 → 2 hours
 *   After 3 retries → no further attempts
 */

import crypto from "crypto";
import { getDb } from "../db";
import { webhooks, webhookDeliveries } from "../../drizzle/schema";
import { eq, and, isNotNull, lte, lt } from "drizzle-orm";

const MAX_RETRIES = 3;

/** Compute the next retry delay in milliseconds for a given attempt number (1-indexed) */
function retryDelayMs(attempt: number): number {
  const schedule = [
    5 * 60 * 1000,       // 5 min after 1st failure
    30 * 60 * 1000,      // 30 min after 2nd failure
    2 * 60 * 60 * 1000,  // 2 h after 3rd failure
  ];
  return schedule[attempt - 1] ?? 2 * 60 * 60 * 1000;
}

function signPayload(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export interface RetryResult {
  attempted: number;
  succeeded: number;
  failed: number;
}

export async function retryFailedWebhooks(): Promise<RetryResult> {
  const db = await getDb();
  if (!db) return { attempted: 0, succeeded: 0, failed: 0 };

  const now = new Date();

  // Find failed deliveries that are due for retry
  const due = await db
    .select()
    .from(webhookDeliveries)
    .where(
      and(
        eq(webhookDeliveries.success, false),
        lt(webhookDeliveries.attemptCount, MAX_RETRIES + 1),
        isNotNull(webhookDeliveries.nextRetryAt),
        lte(webhookDeliveries.nextRetryAt, now)
      )
    )
    .limit(50); // process at most 50 per run to avoid long-running jobs

  if (due.length === 0) return { attempted: 0, succeeded: 0, failed: 0 };

  let succeeded = 0;
  let failed = 0;

  await Promise.allSettled(
    due.map(async (delivery) => {
      // Look up the parent webhook
      const [wh] = await db
        .select()
        .from(webhooks)
        .where(eq(webhooks.id, delivery.webhookId))
        .limit(1);

      if (!wh || !wh.isActive) {
        // Webhook deleted or disabled — mark as permanently failed
        await db
          .update(webhookDeliveries)
          .set({ nextRetryAt: null })
          .where(eq(webhookDeliveries.id, delivery.id));
        failed++;
        return;
      }

      const payloadStr = delivery.payload;
      const signature = wh.secret ? signPayload(payloadStr, wh.secret) : "";
      const timestamp = new Date().toISOString();

      let responseStatus = 0;
      let responseBody = "";
      let success = false;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(wh.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Event": delivery.eventType,
            "X-Webhook-Signature": `sha256=${signature}`,
            "X-Webhook-Timestamp": timestamp,
            "X-Webhook-Retry": String(delivery.attemptCount),
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

      const newAttemptCount = (delivery.attemptCount ?? 1) + 1;
      const nextRetryAt =
        !success && newAttemptCount <= MAX_RETRIES
          ? new Date(Date.now() + retryDelayMs(newAttemptCount))
          : null;

      await db
        .update(webhookDeliveries)
        .set({
          success,
          responseStatus,
          responseBody: responseBody.substring(0, 4000),
          attemptCount: newAttemptCount,
          nextRetryAt,
          deliveredAt: new Date(),
        })
        .where(eq(webhookDeliveries.id, delivery.id));

      if (success) {
        succeeded++;
      } else {
        failed++;
      }
    })
  );

  console.log(
    `[WebhookRetry] Processed ${due.length} deliveries — ${succeeded} succeeded, ${failed} failed`
  );

  return { attempted: due.length, succeeded, failed };
}

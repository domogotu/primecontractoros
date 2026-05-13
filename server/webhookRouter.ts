/**
 * Webhook management router - CRUD for user-configurable outbound webhooks
 */
import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { webhooks, webhookDeliveries } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { enforcePermission } from "./rbacMiddleware";
import { logAudit } from "./featureRouter";
import { WEBHOOK_EVENTS } from "./services/webhookDispatch";
import crypto from "crypto";

export const webhookRouter = router({
  // List all webhooks for the workspace
  list: protectedProcedure.query(async ({ ctx }) => {
    const { wsId } = await enforcePermission(ctx.user.id, "read");
    const db = await getDb();
    return db!
      .select()
      .from(webhooks)
      .where(eq(webhooks.workspaceId, wsId))
      .orderBy(desc(webhooks.createdAt));
  }),

  // Get a single webhook with recent deliveries
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const { wsId } = await enforcePermission(ctx.user.id, "read");
      const db = await getDb();
      const [webhook] = await db!
        .select()
        .from(webhooks)
        .where(and(eq(webhooks.id, input.id), eq(webhooks.workspaceId, wsId)));
      if (!webhook) return null;

      const deliveries = await db!
        .select()
        .from(webhookDeliveries)
        .where(eq(webhookDeliveries.webhookId, input.id))
        .orderBy(desc(webhookDeliveries.deliveredAt))
        .limit(20);

      return { ...webhook, deliveries };
    }),

  // Create a new webhook
  create: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
        description: z.string().optional(),
        events: z.array(z.string()).min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { wsId } = await enforcePermission(ctx.user.id, "manage_settings");
      const db = await getDb();
      // Generate a signing secret
      const secret = crypto.randomBytes(32).toString("hex");
      const [result] = await db!.insert(webhooks).values({
        workspaceId: wsId,
        url: input.url,
        description: input.description || null,
        secret,
        events: JSON.stringify(input.events),
        isActive: true,
      });
      try {
        await logAudit(wsId, ctx.user.id, "create", "webhook", Number(result.insertId), input);
      } catch {}
      return { id: Number(result.insertId), secret };
    }),

  // Update a webhook
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        url: z.string().url().optional(),
        description: z.string().optional(),
        events: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { wsId } = await enforcePermission(ctx.user.id, "manage_settings");
      const db = await getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.url !== undefined) updateData.url = data.url;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.events !== undefined) updateData.events = JSON.stringify(data.events);
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      await db!
        .update(webhooks)
        .set(updateData)
        .where(and(eq(webhooks.id, id), eq(webhooks.workspaceId, wsId)));
      try {
        await logAudit(wsId, ctx.user.id, "update", "webhook", id, data);
      } catch {}
      return { success: true };
    }),

  // Delete a webhook
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { wsId } = await enforcePermission(ctx.user.id, "manage_settings");
      const db = await getDb();
      await db!
        .delete(webhooks)
        .where(and(eq(webhooks.id, input.id), eq(webhooks.workspaceId, wsId)));
      try {
        await logAudit(wsId, ctx.user.id, "delete", "webhook", input.id, null);
      } catch {}
      return { success: true };
    }),

  // Regenerate the signing secret
  regenerateSecret: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { wsId } = await enforcePermission(ctx.user.id, "manage_settings");
      const db = await getDb();
      const newSecret = crypto.randomBytes(32).toString("hex");
      await db!
        .update(webhooks)
        .set({ secret: newSecret })
        .where(and(eq(webhooks.id, input.id), eq(webhooks.workspaceId, wsId)));
      return { secret: newSecret };
    }),

  // List delivery history for a webhook
  deliveries: protectedProcedure
    .input(z.object({ webhookId: z.number(), limit: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const { wsId } = await enforcePermission(ctx.user.id, "read");
      const db = await getDb();
      return db!
        .select()
        .from(webhookDeliveries)
        .where(
          and(
            eq(webhookDeliveries.webhookId, input.webhookId),
            eq(webhookDeliveries.workspaceId, wsId)
          )
        )
        .orderBy(desc(webhookDeliveries.deliveredAt))
        .limit(input.limit || 50);
    }),

  // Test a webhook by sending a test event
  test: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { wsId } = await enforcePermission(ctx.user.id, "manage_settings");
      const db = await getDb();
      const [webhook] = await db!
        .select()
        .from(webhooks)
        .where(and(eq(webhooks.id, input.id), eq(webhooks.workspaceId, wsId)));
      if (!webhook) throw new Error("Webhook not found");

      const payload = JSON.stringify({
        event: "test.ping",
        timestamp: new Date().toISOString(),
        data: { message: "This is a test webhook from PrimeContractorOS" },
      });

      const signature = webhook.secret
        ? crypto.createHmac("sha256", webhook.secret).update(payload).digest("hex")
        : "";

      let responseStatus = 0;
      let responseBody = "";
      let success = false;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Event": "test.ping",
            "X-Webhook-Signature": `sha256=${signature}`,
            "User-Agent": "PrimeContractorOS-Webhook/1.0",
          },
          body: payload,
          signal: controller.signal,
        });
        clearTimeout(timeout);
        responseStatus = response.status;
        responseBody = await response.text().catch(() => "");
        success = response.ok;
      } catch (err: any) {
        responseBody = err.message || "Request failed";
      }

      // Log delivery
      await db!.insert(webhookDeliveries).values({
        webhookId: webhook.id,
        workspaceId: wsId,
        eventType: "test.ping",
        payload,
        responseStatus,
        responseBody: responseBody.substring(0, 4000),
        success,
        attemptCount: 1,
      });

      return { success, responseStatus, responseBody: responseBody.substring(0, 500) };
    }),

  // Get available event types
  eventTypes: protectedProcedure.query(() => {
    return WEBHOOK_EVENTS.map((e) => ({
      value: e,
      label: e
        .split(".")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" → "),
    }));
  }),
});

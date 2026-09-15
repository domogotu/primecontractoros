import { randomBytes } from "node:crypto";
import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { planFeatures, emailTemplates, invites } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { enforcePermission } from "./rbacMiddleware";
import { logAudit } from "./featureRouter";

function requireDb<T>(db: T | null): T {
  if (!db) throw new Error("Database not available");
  return db;
}

export const planFeaturesRouter = router({
  getMatrix: protectedProcedure.query(async () => {
    const db = requireDb(await getDb());
    return db.select().from(planFeatures);
  }),
  list: protectedProcedure.query(async () => {
    const db = requireDb(await getDb());
    return db.select().from(planFeatures);
  }),
});

// Email templates are platform-wide records. Only platform admins may mutate or enumerate them.
export const emailTemplatesRouter = router({
  list: adminProcedure.query(async () => {
    const db = requireDb(await getDb());
    return db.select().from(emailTemplates).orderBy(desc(emailTemplates.createdAt));
  }),
  create: adminProcedure.input(z.object({ name: z.string().min(1), subject: z.string().min(1), body: z.string(), category: z.string().optional() })).mutation(async ({ input }) => {
    const db = requireDb(await getDb());
    await db.insert(emailTemplates).values({
      templateKey: input.name.toLowerCase().trim().replace(/\s+/g, "_"),
      subject: input.subject,
      htmlBody: input.body,
      isEnabled: true,
    });
    return { success: true };
  }),
  update: adminProcedure.input(z.object({ id: z.number(), name: z.string().optional(), subject: z.string().optional(), body: z.string().optional(), isEnabled: z.boolean().optional() })).mutation(async ({ input }) => {
    const db = requireDb(await getDb());
    const { id, name, body, ...rest } = input;
    const updateData: Record<string, unknown> = { ...rest };
    if (name !== undefined) updateData.templateKey = name.toLowerCase().trim().replace(/\s+/g, "_");
    if (body !== undefined) updateData.htmlBody = body;
    await db.update(emailTemplates).set(updateData).where(eq(emailTemplates.id, id));
    return { success: true };
  }),
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = requireDb(await getDb());
    await db.delete(emailTemplates).where(eq(emailTemplates.id, input.id));
    return { success: true };
  }),
});

export const diagnosticsRouter = router({
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = requireDb(await getDb());
    const wsId = await requireWorkspaceId(ctx.user.id);
    await db.select({ id: invites.id }).from(invites).where(eq(invites.workspaceId, wsId)).limit(1);
    return { database: "connected", workspace: wsId, timestamp: new Date().toISOString(), version: "1.0.0", features: { onboarding: true, notes: true, timeline: true, subcontractors: true, vendors: true } };
  }),
  runCheck: protectedProcedure.input(z.object({ checkType: z.string() })).mutation(async ({ ctx, input }) => {
    const db = requireDb(await getDb());
    const wsId = await requireWorkspaceId(ctx.user.id);
    try {
      await db.select({ id: invites.id }).from(invites).where(eq(invites.workspaceId, wsId)).limit(1);
      return { checkType: input.checkType, status: "passed", details: "Database and workspace access verified", timestamp: new Date().toISOString() };
    } catch (error) {
      return { checkType: input.checkType, status: "failed", details: error instanceof Error ? error.message : "Diagnostic check failed", timestamp: new Date().toISOString() };
    }
  }),
});

// This legacy invite surface remains for compatibility, but user-management permission is mandatory.
export const invitesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = requireDb(await getDb());
    const { wsId } = await enforcePermission(ctx.user.id, "manage_users");
    return db.select().from(invites).where(eq(invites.workspaceId, wsId)).orderBy(desc(invites.createdAt));
  }),
  create: protectedProcedure.input(z.object({ email: z.string().email(), role: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = requireDb(await getDb());
    const { wsId } = await enforcePermission(ctx.user.id, "manage_users");
    const token = randomBytes(32).toString("hex");
    await db.insert(invites).values({ email: input.email, role: input.role || "member", workspaceId: wsId, invitedBy: ctx.user.id, token, status: "pending" });
    try { await logAudit(wsId, ctx.user.id, "create", "invites", 0, { email: input.email, role: input.role || "member" }); } catch {}
    return { success: true, token };
  }),
  revoke: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const db = requireDb(await getDb());
    const { wsId } = await enforcePermission(ctx.user.id, "manage_users");
    await db.update(invites).set({ status: "revoked" }).where(and(eq(invites.id, input.id), eq(invites.workspaceId, wsId)));
    try { await logAudit(wsId, ctx.user.id, "update", "invites", input.id, { status: "revoked" }); } catch {}
    return { success: true };
  }),
});

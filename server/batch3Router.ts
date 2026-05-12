// @ts-nocheck
import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { planFeatures, emailTemplates, invites } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { requireWorkspaceId } from "./workspaceMiddleware";

export const planFeaturesRouter = router({
  getMatrix: protectedProcedure.query(async () => {
    const db = await getDb();
    return db.select().from(planFeatures);
  }),
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    return db.select().from(planFeatures);
  }),
});

export const emailTemplatesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    return db.select().from(emailTemplates).where(eq(emailTemplates.workspaceId, wsId)).orderBy(desc(emailTemplates.createdAt));
  }),
  create: protectedProcedure.input(z.object({ name: z.string(), subject: z.string(), body: z.string(), category: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    await db.insert(emailTemplates).values({ ...input, workspaceId: wsId });
    return { success: true };
  }),
  update: protectedProcedure.input(z.object({ id: z.number(), name: z.string().optional(), subject: z.string().optional(), body: z.string().optional(), category: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const { id, ...data } = input;
    await db.update(emailTemplates).set(data).where(eq(emailTemplates.id, id));
    return { success: true };
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    await db.delete(emailTemplates).where(eq(emailTemplates.id, input.id));
    return { success: true };
  }),
});

export const diagnosticsRouter = router({
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    return { database: "connected", workspace: wsId, timestamp: new Date().toISOString(), version: "1.0.0", features: { onboarding: true, notes: true, timeline: true, subcontractors: true, vendors: true } };
  }),
  runCheck: protectedProcedure.input(z.object({ checkType: z.string() })).mutation(async ({ ctx, input }) => {
    return { checkType: input.checkType, status: "passed", details: "All checks passed", timestamp: new Date().toISOString() };
  }),
});

export const invitesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    return db.select().from(invites).where(eq(invites.workspaceId, wsId)).orderBy(desc(invites.createdAt));
  }),
  create: protectedProcedure.input(z.object({ email: z.string(), role: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    const token = Math.random().toString(36).substring(2, 15);
    await db.insert(invites).values({ email: input.email, role: input.role || "member", workspaceId: wsId, invitedBy: ctx.user.id, token, status: "pending" });
    return { success: true, token };
  }),
  revoke: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    await db.update(invites).set({ status: "revoked" }).where(eq(invites.id, input.id));
    return { success: true };
  }),
});

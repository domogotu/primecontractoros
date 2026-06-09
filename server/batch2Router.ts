// @ts-nocheck
import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { subcontractors, vendors, documentVersions, fileLinks, changeOrders } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { enforcePermission } from "./rbacMiddleware";
import { logAudit } from "./featureRouter";

export const subcontractorsRouter = router({
  list: protectedProcedure
    .input(z.object({ contractId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    const conditions: any[] = [eq(subcontractors.workspaceId, wsId)];
    if (input?.contractId) conditions.push(eq(subcontractors.linkedContractId, input.contractId));
    return db.select().from(subcontractors).where(and(...conditions)).orderBy(desc(subcontractors.createdAt));
  }),
  create: protectedProcedure.input(z.object({ companyName: z.string(), contactName: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), specialty: z.string().optional(), status: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const { wsId } = await enforcePermission(ctx.user.id, "write");
    await db.insert(subcontractors).values({ ...input, workspaceId: wsId });
    try { await logAudit(wsId, ctx.user.id, "create", "subcontractors", 0, input); } catch {}
    return { success: true };
  }),
  update: protectedProcedure.input(z.object({ id: z.number(), companyName: z.string().optional(), contactName: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), specialty: z.string().optional(), status: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    await enforcePermission(ctx.user.id, "write");
    const { id, ...data } = input;
    await db.update(subcontractors).set(data).where(eq(subcontractors.id, id));
    try { await logAudit(wsId, ctx.user.id, "update", "subcontractors", 0, input); } catch {}
    return { success: true };
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    await enforcePermission(ctx.user.id, "delete");
    await db.delete(subcontractors).where(eq(subcontractors.id, input.id));
    try { await logAudit(wsId, ctx.user.id, "delete", "subcontractors", input.id, null); } catch {}
    return { success: true };
  }),
});

export const vendorsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    return db.select().from(vendors).where(eq(vendors.workspaceId, wsId)).orderBy(desc(vendors.createdAt));
  }),
  create: protectedProcedure.input(z.object({ companyName: z.string(), category: z.string().optional(), contactName: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), status: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const { wsId } = await enforcePermission(ctx.user.id, "write");
    await db.insert(vendors).values({ ...input, workspaceId: wsId });
    try { await logAudit(wsId, ctx.user.id, "create", "vendors", 0, input); } catch {}
    return { success: true };
  }),
  update: protectedProcedure.input(z.object({ id: z.number(), companyName: z.string().optional(), category: z.string().optional(), contactName: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), status: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    await enforcePermission(ctx.user.id, "write");
    const { id, ...data } = input;
    await db.update(vendors).set(data).where(eq(vendors.id, id));
    try { await logAudit(wsId, ctx.user.id, "update", "vendors", 0, input); } catch {}
    return { success: true };
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    await enforcePermission(ctx.user.id, "delete");
    await db.delete(vendors).where(eq(vendors.id, input.id));
    try { await logAudit(wsId, ctx.user.id, "delete", "vendors", input.id, null); } catch {}
    return { success: true };
  }),
});

export const documentVersionsRouter = router({
  list: protectedProcedure.input(z.object({ fileId: z.number() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    return db.select().from(documentVersions).where(eq(documentVersions.fileId, input.fileId)).orderBy(desc(documentVersions.createdAt));
  }),
  create: protectedProcedure.input(z.object({ fileId: z.number(), versionNumber: z.number(), changeDescription: z.string().optional(), fileUrl: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    await enforcePermission(ctx.user.id, "write");
    await db.insert(documentVersions).values({ ...input, createdBy: ctx.user.id });
    try { await logAudit(wsId, ctx.user.id, "create", "documentVersions", 0, input); } catch {}
    return { success: true };
  }),
});

export const changeOrdersRouter = router({
  list: protectedProcedure
    .input(z.object({ contractId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    const conditions: any[] = [eq(changeOrders.workspaceId, wsId)];
    if (input?.contractId) conditions.push(eq(changeOrders.contractId, input.contractId));
    return db.select().from(changeOrders).where(and(...conditions)).orderBy(desc(changeOrders.createdAt));
  }),
  create: protectedProcedure.input(z.object({
    title: z.string(),
    description: z.string().optional(),
    changeType: z.string().optional(),
    status: z.string().optional(),
    impactCost: z.string().optional(),
    impactSchedule: z.string().optional(),
    submittedBy: z.string().optional(),
    contractId: z.number().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const { wsId } = await enforcePermission(ctx.user.id, "write");
    await db.insert(changeOrders).values({ ...input, workspaceId: wsId });
    try { await logAudit(wsId, ctx.user.id, "create", "changeOrders", 0, input); } catch {}
    return { success: true };
  }),
  update: protectedProcedure.input(z.object({
    id: z.number(),
    title: z.string().optional(),
    description: z.string().optional(),
    changeType: z.string().optional(),
    status: z.string().optional(),
    impactCost: z.string().optional(),
    impactSchedule: z.string().optional(),
    reviewedBy: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const { wsId } = await enforcePermission(ctx.user.id, "write");
    const { id, ...data } = input;
    await db.update(changeOrders).set(data).where(eq(changeOrders.id, id));
    try { await logAudit(wsId, ctx.user.id, "update", "changeOrders", id, data); } catch {}
    return { success: true };
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const { wsId } = await enforcePermission(ctx.user.id, "delete");
    await db.delete(changeOrders).where(eq(changeOrders.id, input.id));
    try { await logAudit(wsId, ctx.user.id, "delete", "changeOrders", input.id, null); } catch {}
    return { success: true };
  }),
});

export const fileLinksRouter = router({
  list: protectedProcedure.input(z.object({ recordType: z.string(), recordId: z.number() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    return db.select().from(fileLinks).where(eq(fileLinks.recordType, input.recordType));
  }),
  create: protectedProcedure.input(z.object({ fileId: z.number(), recordType: z.string(), recordId: z.number(), linkType: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    await enforcePermission(ctx.user.id, "write");
    await db.insert(fileLinks).values(input);
    try { await logAudit(wsId, ctx.user.id, "create", "fileLinks", 0, input); } catch {}
    return { success: true };
  }),
});

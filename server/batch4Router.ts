// @ts-nocheck
import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { generatedDocuments, flowdownReviews, customerAdoption } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { requireWorkspaceId } from "./workspaceMiddleware";

export const documentGenerationRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    return db.select().from(generatedDocuments).where(eq(generatedDocuments.workspaceId, wsId)).orderBy(desc(generatedDocuments.createdAt));
  }),
  create: protectedProcedure.input(z.object({ templateType: z.string(), title: z.string(), parameters: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    await db.insert(generatedDocuments).values({ workspaceId: wsId, templateType: input.templateType, title: input.title, parameters: input.parameters || "{}", status: "draft", createdBy: ctx.user.id });
    return { success: true };
  }),
  get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    const rows = await db.select().from(generatedDocuments).where(eq(generatedDocuments.id, input.id));
    return rows[0] || null;
  }),
});

export const flowdownReviewsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    return db.select().from(flowdownReviews).where(eq(flowdownReviews.workspaceId, wsId)).orderBy(desc(flowdownReviews.createdAt));
  }),
  create: protectedProcedure.input(z.object({ contractId: z.number(), clauseReference: z.string(), clauseText: z.string().optional(), flowdownRequired: z.boolean().optional(), notes: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    await db.insert(flowdownReviews).values({ ...input, workspaceId: wsId, status: "pending", reviewedBy: ctx.user.id });
    return { success: true };
  }),
  update: protectedProcedure.input(z.object({ id: z.number(), status: z.string().optional(), notes: z.string().optional(), flowdownRequired: z.boolean().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const { id, ...data } = input;
    await db.update(flowdownReviews).set(data).where(eq(flowdownReviews.id, id));
    return { success: true };
  }),
});

export const customerAdoptionRouter = router({
  getMetrics: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    const rows = await db.select().from(customerAdoption).where(eq(customerAdoption.workspaceId, wsId));
    if (rows.length === 0) return { loginCount: 0, featuresUsed: "[]", lastActive: null, adoptionScore: 0 };
    return rows[0];
  }),
  track: protectedProcedure.input(z.object({ featureName: z.string() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    const existing = await db.select().from(customerAdoption).where(eq(customerAdoption.workspaceId, wsId));
    if (existing.length === 0) {
      await db.insert(customerAdoption).values({ workspaceId: wsId, userId: ctx.user.id, loginCount: 1, featuresUsed: JSON.stringify([input.featureName]), lastActive: new Date(), adoptionScore: 10 });
    } else {
      const features = JSON.parse(existing[0].featuresUsed || "[]");
      if (!features.includes(input.featureName)) features.push(input.featureName);
      await db.update(customerAdoption).set({ featuresUsed: JSON.stringify(features), lastActive: new Date(), adoptionScore: Math.min(100, features.length * 10) }).where(eq(customerAdoption.workspaceId, wsId));
    }
    return { success: true };
  }),
});

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

import { businessProfiles } from "../drizzle/schema";
import { and } from "drizzle-orm";

export const businessProfileRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    const rows = await db.select().from(businessProfiles).where(eq(businessProfiles.workspaceId, wsId));
    return rows[0] || null;
  }),
  upsert: protectedProcedure.input(z.object({
    legalName: z.string().optional(),
    dba: z.string().optional(),
    website: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    entityType: z.string().optional(),
    uei: z.string().optional(),
    cage: z.string().optional(),
    samStatus: z.enum(["active", "expired", "pending", "not_registered"]).optional(),
    samRenewalDate: z.string().optional(),
    naicsCodes: z.string().optional(),
    certifications: z.string().optional(),
    capabilities: z.string().optional(),
    contractingModel: z.enum(["prime", "sub", "both"]).optional(),
    usesSubcontractors: z.boolean().optional(),
    defaultContactName: z.string().optional(),
    defaultContactEmail: z.string().optional(),
    defaultContactPhone: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    const existing = await db.select().from(businessProfiles).where(eq(businessProfiles.workspaceId, wsId));
    // Calculate completeness
    const fields = [input.legalName, input.email, input.phone, input.address, input.uei, input.cage, input.naicsCodes, input.certifications, input.capabilities, input.contractingModel, input.defaultContactName, input.defaultContactEmail];
    const filled = fields.filter(f => f && f.length > 0).length;
    const score = Math.round((filled / fields.length) * 100);
    const data = {
      ...input,
      samRenewalDate: input.samRenewalDate ? new Date(input.samRenewalDate) : undefined,
      profileCompletenessScore: score,
    };
    if (existing.length === 0) {
      await db.insert(businessProfiles).values({ workspaceId: wsId, ...data });
    } else {
      await db.update(businessProfiles).set(data).where(eq(businessProfiles.workspaceId, wsId));
    }
    return { success: true, completenessScore: score };
  }),
});

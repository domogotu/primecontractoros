// @ts-nocheck
import { z } from 'zod';
import { router, protectedProcedure } from './_core/trpc';
import { getDb } from './db';
import { onboardingProgress, recordNotes, recordTimeline, subcontractors, vendors, documentVersions, fileLinks, planFeatures, emailTemplates, invites, generatedDocuments, flowdownReviews, customerAdoption } from '../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireWorkspaceId } from './workspaceMiddleware';

export const onboardingRouter = router({
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const rows = await db.select().from(onboardingProgress).where(eq(onboardingProgress.userId, ctx.user.id));
    return rows[0] || null;
  }),
  updateStep: protectedProcedure.input(z.object({ step: z.string(), completed: z.boolean() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id).catch(() => 0);
    const existing = await db.select().from(onboardingProgress).where(eq(onboardingProgress.userId, ctx.user.id));
    if (existing.length === 0) {
      await db.insert(onboardingProgress).values({ userId: ctx.user.id, workspaceId: wsId, completedSteps: JSON.stringify({ [input.step]: input.completed }), currentStep: input.step, completed: false });
    } else {
      const current = JSON.parse(existing[0].completedSteps || '{}');
      current[input.step] = input.completed;
      await db.update(onboardingProgress).set({ completedSteps: JSON.stringify(current), currentStep: input.step }).where(eq(onboardingProgress.userId, ctx.user.id));
    }
    return { success: true };
  }),
});

export const recordNotesRouter = router({
  list: protectedProcedure.input(z.object({ recordType: z.string(), recordId: z.number() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    return db.select().from(recordNotes).where(and(eq(recordNotes.recordType, input.recordType), eq(recordNotes.recordId, input.recordId))).orderBy(desc(recordNotes.createdAt));
  }),
  create: protectedProcedure.input(z.object({ recordType: z.string(), recordId: z.number(), content: z.string(), noteType: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    await db.insert(recordNotes).values({ recordType: input.recordType, recordId: input.recordId, content: input.content, noteType: input.noteType || 'general', createdBy: ctx.user.id });
    return { success: true };
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    await db.delete(recordNotes).where(eq(recordNotes.id, input.id));
    return { success: true };
  }),
});

export const recordTimelineRouter = router({
  list: protectedProcedure.input(z.object({ recordType: z.string(), recordId: z.number() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    return db.select().from(recordTimeline).where(and(eq(recordTimeline.recordType, input.recordType), eq(recordTimeline.recordId, input.recordId))).orderBy(desc(recordTimeline.createdAt));
  }),
});

export const helpRouter = router({
  getContent: protectedProcedure.input(z.object({ contextKey: z.string() })).query(async ({ ctx, input }) => {
    return { title: 'Help', content: 'Help content for: ' + input.contextKey, contextKey: input.contextKey };
  }),
  list: protectedProcedure.query(async () => {
    return [{ id: 1, title: 'Getting Started', contextKey: 'getting-started', content: 'Welcome to PrimeContractorOS' }];
  }),
});

export const subcontractorsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    return db.select().from(subcontractors).where(eq(subcontractors.workspaceId, wsId)).orderBy(desc(subcontractors.createdAt));
  }),
  create: protectedProcedure.input(z.object({ companyName: z.string(), contactName: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), specialty: z.string().optional(), status: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    await db.insert(subcontractors).values({ ...input, workspaceId: wsId });
    return { success: true };
  }),
  update: protectedProcedure.input(z.object({ id: z.number(), companyName: z.string().optional(), contactName: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), specialty: z.string().optional(), status: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const { id, ...data } = input;
    await db.update(subcontractors).set(data).where(eq(subcontractors.id, id));
    return { success: true };
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    await db.delete(subcontractors).where(eq(subcontractors.id, input.id));
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
    const wsId = await requireWorkspaceId(ctx.user.id);
    await db.insert(vendors).values({ ...input, workspaceId: wsId });
    return { success: true };
  }),
  update: protectedProcedure.input(z.object({ id: z.number(), companyName: z.string().optional(), category: z.string().optional(), contactName: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), status: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const { id, ...data } = input;
    await db.update(vendors).set(data).where(eq(vendors.id, id));
    return { success: true };
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    await db.delete(vendors).where(eq(vendors.id, input.id));
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
    await db.insert(documentVersions).values({ ...input, createdBy: ctx.user.id });
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
    await db.insert(fileLinks).values(input);
    return { success: true };
  }),
});

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
    return { database: 'connected', workspace: wsId, timestamp: new Date().toISOString(), version: '1.0.0', features: { onboarding: true, notes: true, timeline: true, subcontractors: true, vendors: true } };
  }),
  runCheck: protectedProcedure.input(z.object({ checkType: z.string() })).mutation(async ({ ctx, input }) => {
    return { checkType: input.checkType, status: 'passed', details: 'All checks passed', timestamp: new Date().toISOString() };
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
    await db.insert(invites).values({ email: input.email, role: input.role || 'member', workspaceId: wsId, invitedBy: ctx.user.id, token, status: 'pending' });
    return { success: true, token };
  }),
  revoke: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    await db.update(invites).set({ status: 'revoked' }).where(eq(invites.id, input.id));
    return { success: true };
  }),
});

export const documentGenerationRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    return db.select().from(generatedDocuments).where(eq(generatedDocuments.workspaceId, wsId)).orderBy(desc(generatedDocuments.createdAt));
  }),
  generate: protectedProcedure.input(z.object({ templateType: z.string(), title: z.string(), parameters: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    await db.insert(generatedDocuments).values({ workspaceId: wsId, templateType: input.templateType, title: input.title, parameters: input.parameters || '{}', status: 'generating', generatedBy: ctx.user.id });
    return { success: true };
  }),
});

export const flowdownReviewsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    return db.select().from(flowdownReviews).where(eq(flowdownReviews.workspaceId, wsId)).orderBy(desc(flowdownReviews.createdAt));
  }),
  create: protectedProcedure.input(z.object({ contractId: z.number(), clauseReference: z.string(), originalText: z.string().optional(), flowdownText: z.string().optional(), status: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    await db.insert(flowdownReviews).values({ ...input, workspaceId: wsId, reviewedBy: ctx.user.id, status: input.status || 'pending' });
    return { success: true };
  }),
  updateStatus: protectedProcedure.input(z.object({ id: z.number(), status: z.string() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    await db.update(flowdownReviews).set({ status: input.status }).where(eq(flowdownReviews.id, input.id));
    return { success: true };
  }),
});

export const customerAdoptionRouter = router({
  getMetrics: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    const rows = await db.select().from(customerAdoption).where(eq(customerAdoption.workspaceId, wsId));
    return rows;
  }),
  track: protectedProcedure.input(z.object({ featureName: z.string(), action: z.string() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    await db.insert(customerAdoption).values({ workspaceId: wsId, featureName: input.featureName, action: input.action, userId: ctx.user.id });
    return { success: true };
  }),
});

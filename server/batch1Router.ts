import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { onboardingProgress, recordNotes, recordTimeline, helpArticles } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { logAudit } from "./featureRouter";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { enforcePermission } from "./rbacMiddleware";

export const onboardingRouter = router({
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const wsId = await requireWorkspaceId(ctx.user.id);
    const rows = await db.select().from(onboardingProgress).where(and(eq(onboardingProgress.userId, ctx.user.id), eq(onboardingProgress.workspaceId, wsId)));
    return rows[0] || null;
  }),
  updateStep: protectedProcedure.input(z.object({ step: z.string(), completed: z.boolean() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const wsId = await requireWorkspaceId(ctx.user.id);
    const existing = await db.select().from(onboardingProgress).where(and(eq(onboardingProgress.userId, ctx.user.id), eq(onboardingProgress.workspaceId, wsId)));
    if (existing.length === 0) {
      await db.insert(onboardingProgress).values({ userId: ctx.user.id, workspaceId: wsId, completedSteps: { [input.step]: input.completed }, stepData: { currentStepKey: input.step }, status: "in_progress" });
    } else {
      const current = (existing[0].completedSteps && typeof existing[0].completedSteps === "object" ? { ...(existing[0].completedSteps as Record<string, boolean>) } : {}) as Record<string, boolean>;
      current[input.step] = input.completed;
      await db.update(onboardingProgress).set({ completedSteps: current, stepData: { currentStepKey: input.step } }).where(and(eq(onboardingProgress.userId, ctx.user.id), eq(onboardingProgress.workspaceId, wsId)));
    }
    try { await logAudit(wsId, ctx.user.id, "update", "onboarding", 0, input); } catch {}
    return { success: true };
  }),
});

export const recordNotesRouter = router({
  list: protectedProcedure.input(z.object({ recordType: z.string(), recordId: z.number() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const wsId = await requireWorkspaceId(ctx.user.id);
    return db.select().from(recordNotes).where(and(eq(recordNotes.workspaceId, wsId), eq(recordNotes.targetType, input.recordType), eq(recordNotes.targetId, input.recordId))).orderBy(desc(recordNotes.createdAt));
  }),
  create: protectedProcedure.input(z.object({ recordType: z.string(), recordId: z.number(), content: z.string(), noteType: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { wsId } = await enforcePermission(ctx.user.id, "write");
    await db.insert(recordNotes).values({ workspaceId: wsId, targetType: input.recordType, targetId: input.recordId, noteText: input.content, authorId: ctx.user.id });
    try { await logAudit(wsId, ctx.user.id, "create", "recordNotes", 0, { recordType: input.recordType, recordId: input.recordId }); } catch {}
    return { success: true };
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { wsId } = await enforcePermission(ctx.user.id, "delete");
    await db.delete(recordNotes).where(and(eq(recordNotes.id, input.id), eq(recordNotes.workspaceId, wsId)));
    try { await logAudit(wsId, ctx.user.id, "delete", "recordNotes", input.id, null); } catch {}
    return { success: true };
  }),
});

export const recordTimelineRouter = router({
  list: protectedProcedure.input(z.object({ recordType: z.string(), recordId: z.number() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const wsId = await requireWorkspaceId(ctx.user.id);
    return db.select().from(recordTimeline).where(and(eq(recordTimeline.workspaceId, wsId), eq(recordTimeline.targetType, input.recordType), eq(recordTimeline.targetId, input.recordId))).orderBy(desc(recordTimeline.createdAt));
  }),
});

export const helpRouter = router({
  getContent: protectedProcedure
    .input(z.object({ contextKey: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [article] = await db
        .select()
        .from(helpArticles)
        .where(and(eq(helpArticles.slug, input.contextKey), eq(helpArticles.isPublished, true)))
        .limit(1);
      if (!article) return null;
      return {
        id: article.id,
        title: article.title,
        content: article.body,
        contextKey: article.slug,
        category: article.category,
        relatedGlossaryTerms: article.relatedGlossaryTerms,
        updatedAt: article.updatedAt,
      };
    }),
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const articles = await db
      .select()
      .from(helpArticles)
      .where(eq(helpArticles.isPublished, true))
      .orderBy(helpArticles.title);
    return articles.map((article) => ({
      id: article.id,
      title: article.title,
      contextKey: article.slug,
      content: article.body,
      category: article.category,
      relatedGlossaryTerms: article.relatedGlossaryTerms,
      updatedAt: article.updatedAt,
    }));
  }),
});

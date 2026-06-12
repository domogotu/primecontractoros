// @ts-nocheck
import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { onboardingProgress, recordNotes, recordTimeline } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { logAudit } from "./featureRouter";
import { requireWorkspaceId } from "./workspaceMiddleware";

export const onboardingRouter = router({
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const rows = await db.select().from(onboardingProgress).where(eq(onboardingProgress.userId, ctx.user.id));
    return rows[0] || null;
  }),
  updateStep: protectedProcedure
    .input(z.object({ step: z.string(), completed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const wsId = await requireWorkspaceId(ctx.user.id).catch(() => 0);
      const existing = await db.select().from(onboardingProgress).where(eq(onboardingProgress.userId, ctx.user.id));
      if (existing.length === 0) {
        await db.insert(onboardingProgress).values({ userId: ctx.user.id, workspaceId: wsId, completedSteps: JSON.stringify({ [input.step]: input.completed }), currentStep: input.step, completed: false });
      } else {
        const current = JSON.parse(existing[0].completedSteps || "{}");
        current[input.step] = input.completed;
        await db.update(onboardingProgress).set({ completedSteps: JSON.stringify(current), currentStep: input.step }).where(eq(onboardingProgress.userId, ctx.user.id));
      }
      try { await logAudit(wsId, ctx.user.id, "update", "onboarding", 0, input); } catch {}
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
    await db.insert(recordNotes).values({ recordType: input.recordType, recordId: input.recordId, content: input.content, noteType: input.noteType || "general", createdBy: ctx.user.id });
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
    return { title: "Help", content: "Help content for: " + input.contextKey, contextKey: input.contextKey };
  }),
  list: protectedProcedure.query(async () => {
    return [{ id: 1, title: "Getting Started", contextKey: "getting-started", content: "Welcome to PrimeContractorOS" }];
  }),
});

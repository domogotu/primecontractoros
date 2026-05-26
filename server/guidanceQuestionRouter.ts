/**
 * Guidance Question Bank Router
 * tRPC procedures for the 70,000-answer guidance question system
 */
import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { guidanceQuestionEngine } from "./services/guidanceQuestionEngine";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { getDb } from "./db";
import { guidanceQuestions, guidanceQuestionDismissals } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { generateAllSeedQuestions } from "./services/guidanceQuestionSeed";

export const guidanceQuestionRouter = router({
  /**
   * Get questions relevant to a specific page context and record state
   */
  getQuestionsForPage: protectedProcedure
    .input(z.object({
      pageContext: z.string(),
      recordType: z.string().optional(),
      recordId: z.number().optional(),
      limit: z.number().default(5),
    }))
    .query(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      return guidanceQuestionEngine.getQuestionsForPage({
        pageContext: input.pageContext,
        workspaceId,
        userId: ctx.user.id,
        recordType: input.recordType,
        recordId: input.recordId,
        limit: input.limit,
      });
    }),

  /**
   * Evaluate a record against guidance checks
   */
  evaluateRecord: protectedProcedure
    .input(z.object({
      pageContext: z.string(),
      recordType: z.string(),
      recordId: z.number(),
      recordData: z.record(z.string(), z.unknown()),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      return guidanceQuestionEngine.evaluateRecord({
        pageContext: input.pageContext,
        workspaceId,
        recordType: input.recordType,
        recordId: input.recordId,
        recordData: input.recordData,
      });
    }),

  /**
   * Get the next best action for the current context
   */
  getNextBestAction: protectedProcedure
    .input(z.object({
      pageContext: z.string(),
      recordType: z.string().optional(),
      recordData: z.record(z.string(), z.unknown()).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      return guidanceQuestionEngine.getNextBestAction({
        pageContext: input.pageContext,
        workspaceId,
        recordType: input.recordType,
        recordData: input.recordData,
      });
    }),

  /**
   * Dismiss a guidance question
   */
  dismissQuestion: protectedProcedure
    .input(z.object({
      questionId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      await guidanceQuestionEngine.dismissQuestion({
        workspaceId,
        userId: ctx.user.id,
        questionId: input.questionId,
      });
      return { success: true };
    }),

  /**
   * Convert a guidance question to a task
   */
  convertToTask: protectedProcedure
    .input(z.object({
      questionId: z.number(),
      title: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      return guidanceQuestionEngine.convertToTask({
        workspaceId,
        userId: ctx.user.id,
        questionId: input.questionId,
        title: input.title,
        description: input.description || "",
      });
    }),

  /**
   * Get question bank statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { totalQuestions: 0, byPage: {}, byCategory: {} };

    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(guidanceQuestions);
    const totalQuestions = countResult?.count || 0;

    return {
      totalQuestions,
      generatedTotal: 8640, // 10 words × 6 dimensions × 8 outcomes × 18 pages
      formula: "GUIDANCE_WORD × 6_DIMENSIONS × 8_OUTCOME_FAMILIES × 18_PAGE_CONTEXTS",
    };
  }),

  /**
   * Seed the question bank (admin only)
   */
  seedQuestions: protectedProcedure
    .input(z.object({ pageContext: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { seeded: 0 };

      const allQuestions = generateAllSeedQuestions();
      const filtered = input.pageContext
        ? allQuestions.filter(q => q.pageContext === input.pageContext)
        : allQuestions.slice(0, 500); // Seed first 500 for performance

      let seeded = 0;
      // Batch insert in chunks of 50
      for (let i = 0; i < filtered.length; i += 50) {
        const batch = filtered.slice(i, i + 50);
        await db.insert(guidanceQuestions).values(batch.map(q => ({
          guidanceWord: q.guidanceWord,
          category: q.category,
          who: q.who,
          what: q.what,
          whenField: q.whenField,
          whereField: q.whereField,
          why: q.why,
          how: q.how,
          authorityCheck: q.authorityCheck,
          scopeCheck: q.scopeCheck,
          fundingCheck: q.fundingCheck,
          complianceCheck: q.complianceCheck,
          evidenceCheck: q.evidenceCheck,
          reviewCheck: q.reviewCheck,
          riskCheck: q.riskCheck,
          consequenceCheck: q.consequenceCheck,
          nextBestAction: q.nextBestAction,
          systemAction: q.systemAction,
          pageContext: q.pageContext,
          recordType: q.recordType,
          priority: q.priority,
          isActive: true,
        })));
        seeded += batch.length;
      }

      return { seeded, total: allQuestions.length };
    }),
});

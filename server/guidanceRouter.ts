import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { guidanceEngine } from "./services/guidanceEngine";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { getDb } from "./db";
import { 
  guidancePreferences, 
  guidanceEvents 
} from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const guidanceRouter = router({
  /**
   * Get the next best action for the workspace
   */
  getNextBestAction: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const action = await guidanceEngine.getNextBestAction({ workspaceId, userId: ctx.user.id });
    return action;
  }),

  /**
   * Get all suggested next actions for the workspace
   */
  getAllActions: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const actions = await guidanceEngine.analyzeWorkspace({ workspaceId, userId: ctx.user.id });
    return actions;
  }),

  /**
   * Get user's guidance preference
   */
  getPreference: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const db = await getDb();
    if (!db) return { mode: "balanced", enabledCategories: [] };

    const prefs = await db
      .select()
      .from(guidancePreferences)
      .where(and(
        eq(guidancePreferences.workspaceId, workspaceId),
        eq(guidancePreferences.userId, ctx.user.id)
      ));

    return prefs.length > 0 ? prefs[0] : { mode: "balanced", enabledCategories: [] };
  }),

  /**
   * Update user's guidance preference
   */
  updatePreference: protectedProcedure
    .input(z.object({
      mode: z.enum(["detailed", "balanced", "light"]),
      enabledCategories: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const existing = await db
        .select()
        .from(guidancePreferences)
        .where(and(
          eq(guidancePreferences.workspaceId, workspaceId),
          eq(guidancePreferences.userId, ctx.user.id)
        ));

      if (existing.length > 0) {
        await db
          .update(guidancePreferences)
          .set({
            mode: input.mode,
            enabledCategories: input.enabledCategories ? JSON.stringify(input.enabledCategories) : null,
            updatedAt: new Date(),
          })
          .where(eq(guidancePreferences.id, existing[0].id));
      } else {
        await db.insert(guidancePreferences).values({
          workspaceId,
          userId: ctx.user.id,
          mode: input.mode,
          enabledCategories: input.enabledCategories ? JSON.stringify(input.enabledCategories) : null,
        });
      }

      return { success: true };
    }),

  /**
   * Log a guidance event
   */
  logEvent: protectedProcedure
    .input(z.object({
      eventType: z.string(),
      guidanceCategory: z.string().optional(),
      actionId: z.number().optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(guidanceEvents).values({
        workspaceId,
        userId: ctx.user.id,
        eventType: input.eventType,
        guidanceCategory: input.guidanceCategory,
        actionId: input.actionId,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      });

      return { success: true };
    }),

  /**
   * Get guidance event history
   */
  getEventHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return [];

      return db
        .select()
        .from(guidanceEvents)
        .where(and(
          eq(guidanceEvents.workspaceId, workspaceId),
          eq(guidanceEvents.userId, ctx.user.id)
        ))
        .orderBy(desc(guidanceEvents.createdAt))
        .limit(input.limit);
    }),
});

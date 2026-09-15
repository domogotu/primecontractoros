/**
 * Extended platform admin business control routers for:
 * - Plans Management
 * - Discounts Management
 * - Billing Management
 * - Overrides Management
 * - Consent Records
 * - Backups & Export
 * - Platform Tasks
 */

import { adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb, getInsertId } from "./db";
import {
  planVersions,
  policyVersions,
  backupExports,
  platformTasks,
  platformTaskRuns,
  billingEvents,
  discountUsage,
  consentRecords,
  plans,
  discounts,
  platformBilling,
  platformOverrides,
} from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// ==================== PLAN VERSIONS (AUDIT TRAIL) ====================
export const planVersionsRouter = router({
  list: adminProcedure
    .input(z.object({ planId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(planVersions)
        .where(eq(planVersions.planId, input.planId))
        .orderBy(desc(planVersions.createdAt));
    }),

  create: adminProcedure
    .input(
      z.object({
        planId: z.number(),
        changeType: z.string(),
        changedFields: z.string().optional(),
        previousValues: z.string().optional(),
        newValues: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(planVersions).values({
        ...input,
        changedBy: ctx.user.id,
      });
      return { success: true };
    }),
});

// ==================== DISCOUNT USAGE (TRACKING) ====================
export const discountUsageRouter = router({
  list: adminProcedure
    .input(
      z.object({
        discountId: z.number().optional(),
        offset: z.number().default(0),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      if (input.discountId) {
        return db.select().from(discountUsage)
          .where(eq(discountUsage.discountId, input.discountId))
          .orderBy(desc(discountUsage.appliedAt))
          .limit(input.limit)
          .offset(input.offset);
      }
      return db.select().from(discountUsage)
        .orderBy(desc(discountUsage.appliedAt))
        .limit(input.limit)
        .offset(input.offset);
    }),
});

// ==================== BILLING EVENTS (AUDIT TRAIL) ====================
export const billingEventsRouter = router({
  list: adminProcedure
    .input(
      z.object({
        workspaceId: z.number().optional(),
        offset: z.number().default(0),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      if (input.workspaceId) {
        return db.select().from(billingEvents)
          .where(eq(billingEvents.workspaceId, input.workspaceId))
          .orderBy(desc(billingEvents.createdAt))
          .limit(input.limit)
          .offset(input.offset);
      }
      return db.select().from(billingEvents)
        .orderBy(desc(billingEvents.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  create: adminProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        eventType: z.string(),
        oldState: z.string().optional(),
        newState: z.string().optional(),
        reason: z.string().optional(),
        metadata: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(billingEvents).values({
        ...input,
        adminId: ctx.user.id,
      });
      return { success: true };
    }),
});

// ==================== CONSENT RECORDS ====================
export const consentRecordsRouter = router({
  list: adminProcedure
    .input(
      z.object({
        offset: z.number().default(0),
        limit: z.number().default(50),
        consentType: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      if (input.consentType) {
        return db.select().from(consentRecords)
          .where(eq(consentRecords.consentType, input.consentType))
          .orderBy(desc(consentRecords.acceptedAt))
          .limit(input.limit)
          .offset(input.offset);
      }
      return db.select().from(consentRecords)
        .orderBy(desc(consentRecords.acceptedAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  stats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db)
      return {
        total: 0,
        accepted: 0,
        declined: 0,
        acceptRate: 0,
        byVersion: [],
      };
    const all = await db.select().from(consentRecords);
    const accepted = all.filter((r) => r.action === "accepted").length;
    const declined = all.filter((r) => r.action === "declined").length;

    // Group by policy version
    const byVersion: Record<string, number> = {};
    all.forEach((r) => {
      byVersion[r.policyVersion] = (byVersion[r.policyVersion] || 0) + 1;
    });

    return {
      total: all.length,
      accepted,
      declined,
      acceptRate:
        all.length > 0 ? Math.round((accepted / all.length) * 100) : 0,
      byVersion: Object.entries(byVersion).map(([version, count]) => ({
        version,
        count,
      })),
    };
  }),
});

// ==================== BACKUP EXPORTS ====================
export const backupExportsRouter = router({
  list: adminProcedure
    .input(
      z.object({
        offset: z.number().default(0),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(backupExports)
        .orderBy(desc(backupExports.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  create: adminProcedure
    .input(
      z.object({
        exportType: z.string(),
        tableName: z.string().optional(),
        workspaceId: z.number().optional(),
        fileSize: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(backupExports).values({
        ...input,
        createdBy: ctx.user.id,
        status: "completed",
      });
      return { success: true };
    }),
});

// ==================== PLATFORM TASKS ====================
export const platformTasksRouter = router({
  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(platformTasks).orderBy(platformTasks.name);
  }),

  get: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [task] = await db
        .select()
        .from(platformTasks)
        .where(eq(platformTasks.id, input.id))
        .limit(1);
      return task || null;
    }),

  runNow: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const startedAt = new Date();
      const run = await db.insert(platformTaskRuns).values({
        taskId: input.id,
        status: "running",
        triggeredBy: "manual",
        triggeredByUserId: ctx.user.id,
      });
      // Simulate task completion
      await new Promise((r) => setTimeout(r, 500));
      const completedAt = new Date();
      const durationMs = completedAt.getTime() - startedAt.getTime();
      await db
        .update(platformTaskRuns)
        .set({ status: "success", completedAt, durationMs })
        .where(eq(platformTaskRuns.id, getInsertId(run)));
      return { success: true, runId: getInsertId(run) };
    }),

  taskRuns: adminProcedure
    .input(z.object({ taskId: z.number(), limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(platformTaskRuns)
        .where(eq(platformTaskRuns.taskId, input.taskId))
        .orderBy(desc(platformTaskRuns.createdAt))
        .limit(input.limit);
    }),

  stats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db)
      return {
        completed: 0,
        running: 0,
        pending: 0,
        failed: 0,
        disabled: 0,
      };
    const tasks = await db.select().from(platformTasks);
    const runs = await db.select().from(platformTaskRuns);

    const completed = runs.filter((r) => r.status === "success").length;
    const running = runs.filter((r) => r.status === "running").length;
    const failed = runs.filter((r) => r.status === "failed").length;
    const disabled = tasks.filter((t) => !t.isEnabled).length;

    return {
      completed,
      running,
      pending: 0,
      failed,
      disabled,
    };
  }),
});

// ==================== POLICY VERSIONS ====================
export const policyVersionsRouter = router({
  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(policyVersions)
      .orderBy(desc(policyVersions.createdAt));
  }),

  create: adminProcedure
    .input(
      z.object({
        policyType: z.string(),
        version: z.string(),
        title: z.string(),
        content: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(policyVersions).values({
        ...input,
        isActive: true,
        publishedAt: new Date(),
        createdBy: ctx.user.id,
      });
      return { success: true };
    }),
});

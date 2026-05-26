/**
 * Efficiency Features Router
 * Handles autosave, recent records, status automation, import history, templates, dashboard widgets
 */
import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { getDb } from "./db";
import {
  autosaveDrafts, recentRecords, statusAutomationRules,
  importHistoryTable, recordTemplates, dashboardWidgets,
  opportunities, proposals, contracts, invoices, tasks, payments, deliverables
} from "../drizzle/schema";
import { eq, and, desc, sql, gte } from "drizzle-orm";

export const efficiencyRouter = router({
  // ===== AUTOSAVE =====
  saveDraft: protectedProcedure
    .input(z.object({
      recordType: z.string(),
      recordId: z.number().optional(),
      formData: z.record(z.string(), z.unknown()),
      pageContext: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return { id: 0 };

      // Upsert draft
      const existing = await db.select().from(autosaveDrafts)
        .where(and(
          eq(autosaveDrafts.workspaceId, workspaceId),
          eq(autosaveDrafts.userId, ctx.user.id),
          eq(autosaveDrafts.recordType, input.recordType),
          input.recordId ? eq(autosaveDrafts.recordId, input.recordId) : sql`${autosaveDrafts.recordId} IS NULL`
        ))
        .limit(1);

      if (existing.length > 0) {
        await db.update(autosaveDrafts)
          .set({
            formData: JSON.stringify(input.formData),
            savedAt: new Date(),
          })
          .where(eq(autosaveDrafts.id, existing[0].id));
        return { id: existing[0].id };
      }

      const [result] = await db.insert(autosaveDrafts).values({
        workspaceId,
        userId: ctx.user.id,
        recordType: input.recordType,
        recordId: input.recordId,
        formData: JSON.stringify(input.formData),
      }).$returningId();

      return { id: result.id };
    }),

  getDraft: protectedProcedure
    .input(z.object({
      recordType: z.string(),
      recordId: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return null;

      const [draft] = await db.select().from(autosaveDrafts)
        .where(and(
          eq(autosaveDrafts.workspaceId, workspaceId),
          eq(autosaveDrafts.userId, ctx.user.id),
          eq(autosaveDrafts.recordType, input.recordType),
          input.recordId ? eq(autosaveDrafts.recordId, input.recordId) : sql`${autosaveDrafts.recordId} IS NULL`
        ))
        .limit(1);

      if (!draft) return null;
      return { ...draft, formData: JSON.parse(draft.formData) };
    }),

  deleteDraft: protectedProcedure
    .input(z.object({ draftId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.delete(autosaveDrafts).where(eq(autosaveDrafts.id, input.draftId));
      return { success: true };
    }),

  // ===== RECENT RECORDS =====
  trackView: protectedProcedure
    .input(z.object({
      recordType: z.string(),
      recordId: z.number(),
      title: z.string(),
      route: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return { success: true };

      // Remove existing entry for same record
      await db.delete(recentRecords).where(and(
        eq(recentRecords.userId, ctx.user.id),
        eq(recentRecords.recordType, input.recordType),
        eq(recentRecords.recordId, input.recordId)
      ));

      // Insert new entry
      await db.insert(recentRecords).values({
        workspaceId,
        userId: ctx.user.id,
        recordType: input.recordType,
        recordId: input.recordId,
        recordTitle: input.title,
      });

      // Keep only last 10
      const all = await db.select().from(recentRecords)
        .where(eq(recentRecords.userId, ctx.user.id))
        .orderBy(desc(recentRecords.viewedAt));

      if (all.length > 10) {
        const toDelete = all.slice(10);
        for (const record of toDelete) {
          await db.delete(recentRecords).where(eq(recentRecords.id, record.id));
        }
      }

      return { success: true };
    }),

  getRecentRecords: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    return db.select().from(recentRecords)
      .where(eq(recentRecords.userId, ctx.user.id))
      .orderBy(desc(recentRecords.viewedAt))
      .limit(10);
  }),

  // ===== STATUS AUTOMATION =====
  getAutomationRules: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const db = await getDb();
    if (!db) return [];

    return db.select().from(statusAutomationRules)
      .where(and(
        eq(statusAutomationRules.workspaceId, workspaceId),
        eq(statusAutomationRules.isActive, true)
      ));
  }),

  createAutomationRule: protectedProcedure
    .input(z.object({
      recordType: z.string(),
      triggerCondition: z.string(),
      fromStatus: z.string(),
      toStatus: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return { id: 0 };

      const [result] = await db.insert(statusAutomationRules).values({
        workspaceId,
        recordType: input.recordType,
        triggerCondition: input.triggerCondition,
        fromStatus: input.fromStatus,
        toStatus: input.toStatus,
        description: input.description || "",
        isActive: true,
      }).$returningId();

      return { id: result.id };
    }),

  runAutomation: protectedProcedure.mutation(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const db = await getDb();
    if (!db) return { applied: 0 };

    const rules = await db.select().from(statusAutomationRules)
      .where(and(
        eq(statusAutomationRules.workspaceId, workspaceId),
        eq(statusAutomationRules.isActive, true)
      ));

    let applied = 0;
    const now = new Date();

    for (const rule of rules) {
            if (rule.triggerCondition === "due_date_passed" && rule.recordType === "proposal") {
        // Auto-transition proposals past due date
        await db.update(proposals)
          .set({ status: rule.toStatus as any })
          .where(and(
            eq(proposals.workspaceId, workspaceId),
            sql`${proposals.status} = ${rule.fromStatus}`,
            sql`${proposals.dueDate} < ${now.toISOString()}`
          ));
        applied++;
      }
      if (rule.triggerCondition === "due_date_passed" && rule.recordType === "opportunity") {
        await db.update(opportunities)
          .set({ status: rule.toStatus as any })
          .where(and(
            eq(opportunities.workspaceId, workspaceId),
            sql`${opportunities.status} = ${rule.fromStatus}`,
            sql`${opportunities.dueDate} < ${now.toISOString()}`
          ));
        applied++;
      }
    }

    return { applied };
  }),

  // ===== IMPORT HISTORY =====
  getImportHistory: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const db = await getDb();
    if (!db) return [];

    return db.select().from(importHistoryTable)
      .where(eq(importHistoryTable.workspaceId, workspaceId))
      .orderBy(desc(importHistoryTable.createdAt))
      .limit(50);
  }),

  recordImport: protectedProcedure
    .input(z.object({
      source: z.string(),
      recordType: z.string(),
      recordCount: z.number(),
      status: z.string().default("success"),
      details: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return { id: 0 };

      const [result] = await db.insert(importHistoryTable).values({
        workspaceId,
        userId: ctx.user.id,
        source: input.source,
        recordType: input.recordType,
        recordCount: input.recordCount,
        status: input.status,
        metadata: input.details || "",
      }).$returningId();

      return { id: result.id };
    }),

  // ===== TEMPLATES =====
  getTemplates: protectedProcedure
    .input(z.object({ recordType: z.string() }))
    .query(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return [];

      return db.select().from(recordTemplates)
        .where(and(
          eq(recordTemplates.workspaceId, workspaceId),
          eq(recordTemplates.recordType, input.recordType)
        ));
    }),

  createTemplate: protectedProcedure
    .input(z.object({
      recordType: z.string(),
      name: z.string(),
      description: z.string().optional(),
      templateData: z.record(z.string(), z.unknown()),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return { id: 0 };

      const [result] = await db.insert(recordTemplates).values({
        workspaceId,
        createdBy: ctx.user.id,
        recordType: input.recordType,
        name: input.name,
        description: input.description || "",
        templateData: JSON.stringify(input.templateData),
      }).$returningId();

      return { id: result.id };
    }),

  // ===== DASHBOARD WIDGETS =====
  getWidgets: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const db = await getDb();
    if (!db) return getDefaultWidgets();

    const widgets = await db.select().from(dashboardWidgets)
      .where(and(
        eq(dashboardWidgets.workspaceId, workspaceId),
        eq(dashboardWidgets.userId, ctx.user.id)
      ));

    if (widgets.length === 0) return getDefaultWidgets();
    return widgets.map(w => ({ ...w, config: JSON.parse(w.config || "{}") }));
  }),

  saveWidgetLayout: protectedProcedure
    .input(z.object({
      widgets: z.array(z.object({
        widgetType: z.string(),
        position: z.number(),
        width: z.number(),
        height: z.number(),
        isVisible: z.boolean(),
        config: z.record(z.string(), z.unknown()).optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return { success: false };

      // Delete existing widgets for user
      await db.delete(dashboardWidgets).where(and(
        eq(dashboardWidgets.workspaceId, workspaceId),
        eq(dashboardWidgets.userId, ctx.user.id)
      ));

      // Insert new layout
      for (const widget of input.widgets) {
        await db.insert(dashboardWidgets).values({
          workspaceId,
          userId: ctx.user.id,
          widgetType: widget.widgetType,
          position: widget.position,
          width: widget.width,
          height: widget.height,
          isVisible: widget.isVisible,
          config: JSON.stringify(widget.config || {}),
        });
      }

      return { success: true };
    }),

  // ===== DASHBOARD DATA =====
  getDashboardData: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const db = await getDb();
    if (!db) return getEmptyDashboardData();

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Pipeline summary
    const allOpps = await db.select().from(opportunities)
      .where(eq(opportunities.workspaceId, workspaceId));

    const pipelineSummary = {
      total: allOpps.length,
      byStatus: allOpps.reduce((acc, o) => {
        acc[o.status || "new"] = (acc[o.status || "new"] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    // Upcoming deadlines
    const upcomingDeadlines = await db.select().from(tasks)
      .where(and(
        eq(tasks.workspaceId, workspaceId),
        sql`${tasks.dueDate} IS NOT NULL AND ${tasks.dueDate} <= ${thirtyDaysFromNow.toISOString()}`,
        sql`${tasks.status} != 'done'`
      ))
      .orderBy(tasks.dueDate)
      .limit(10);

    // Contract health
    const allContracts = await db.select().from(contracts)
      .where(eq(contracts.workspaceId, workspaceId));

    const contractHealth = {
      total: allContracts.length,
      healthy: allContracts.filter(c => c.health === "healthy" || !c.health).length,
      atRisk: allContracts.filter(c => c.health === "at_risk" || c.health === "warning").length,
      critical: allContracts.filter(c => c.health === "warning").length,
    };

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentOpps = await db.select().from(opportunities)
      .where(and(
        eq(opportunities.workspaceId, workspaceId),
        gte(opportunities.updatedAt, sevenDaysAgo)
      ))
      .orderBy(desc(opportunities.updatedAt))
      .limit(5);

    return {
      pipelineSummary,
      upcomingDeadlines,
      contractHealth,
      recentActivity: recentOpps.map(o => ({
        type: "opportunity",
        id: o.id,
        title: o.title,
        action: "updated",
        date: o.updatedAt,
      })),
    };
  }),
});

function getDefaultWidgets() {
  return [
    { id: 1, widgetType: "pipeline_summary", position: 0, width: 2, height: 1, isVisible: true, config: {} },
    { id: 2, widgetType: "upcoming_deadlines", position: 1, width: 2, height: 1, isVisible: true, config: {} },
    { id: 3, widgetType: "recent_activity", position: 2, width: 2, height: 1, isVisible: true, config: {} },
    { id: 4, widgetType: "contract_health", position: 3, width: 2, height: 1, isVisible: true, config: {} },
  ];
}

function getEmptyDashboardData() {
  return {
    pipelineSummary: { total: 0, byStatus: {} },
    upcomingDeadlines: [],
    contractHealth: { total: 0, healthy: 0, atRisk: 0, critical: 0 },
    recentActivity: [],
  };
}

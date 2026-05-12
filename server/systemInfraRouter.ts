/**
 * System Infrastructure Router
 * 
 * Provides:
 * - Audit log queries
 * - Notification management
 * - Global search
 * - Report export
 * - Contract health scores
 * - Archive/soft-delete operations
 */

import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { auditLogs, notifications, systemErrors, workspaceRoles, contracts, opportunities, proposals, tasks, invoices, files, aiFindings } from "../drizzle/schema";
import { eq, desc, and, like, or, count, sql } from "drizzle-orm";

// ============================================================
// Audit Log Helper (call from other routers)
// ============================================================
export async function logAuditEvent(params: {
  workspaceId?: number;
  userId?: number;
  actionType: string;
  targetType?: string;
  targetId?: number;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values(params);
}

// ============================================================
// Notification Helper
// ============================================================
export async function createNotification(params: {
  workspaceId: number;
  userId?: number;
  category: string;
  title: string;
  message?: string;
  relatedType?: string;
  relatedId?: number;
  priority?: "low" | "medium" | "high" | "urgent";
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(params);
}

export const systemInfraRouter = router({
  // ============================================================
  // Audit Logs
  // ============================================================
  auditLogs: router({
    list: protectedProcedure
      .input(z.object({
        workspaceId: z.number(),
        actionType: z.string().optional(),
        targetType: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { logs: [], total: 0 };
        const conditions = [eq(auditLogs.workspaceId, input.workspaceId)];
        if (input.actionType) conditions.push(eq(auditLogs.actionType, input.actionType));
        if (input.targetType) conditions.push(eq(auditLogs.targetType, input.targetType));
        const logs = await db.select().from(auditLogs)
          .where(and(...conditions))
          .orderBy(desc(auditLogs.createdAt))
          .limit(input.limit)
          .offset(input.offset);
        const [total] = await db.select({ count: count() }).from(auditLogs).where(and(...conditions));
        return { logs, total: total?.count || 0 };
      }),
  }),

  // ============================================================
  // Notifications
  // ============================================================
  notifications: router({
    list: protectedProcedure
      .input(z.object({
        workspaceId: z.number(),
        unreadOnly: z.boolean().default(false),
        limit: z.number().default(30),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { notifications: [], unreadCount: 0 };
        const conditions: any[] = [eq(notifications.workspaceId, input.workspaceId)];
        if (input.unreadOnly) conditions.push(eq(notifications.isRead, false));
        const items = await db.select().from(notifications)
          .where(and(...conditions))
          .orderBy(desc(notifications.createdAt))
          .limit(input.limit);
        const [unread] = await db.select({ count: count() }).from(notifications)
          .where(and(eq(notifications.workspaceId, input.workspaceId), eq(notifications.isRead, false)));
        return { notifications: items, unreadCount: unread?.count || 0 };
      }),

    markRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, input.notificationId));
        return { success: true };
      }),

    markAllRead: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db.update(notifications).set({ isRead: true }).where(eq(notifications.workspaceId, input.workspaceId));
        return { success: true };
      }),

    dismiss: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db.update(notifications).set({ dismissedAt: new Date() }).where(eq(notifications.id, input.notificationId));
        return { success: true };
      }),
  }),

  // ============================================================
  // Global Search
  // ============================================================
  search: router({
    query: protectedProcedure
      .input(z.object({
        workspaceId: z.number(),
        term: z.string().min(1),
        types: z.array(z.string()).optional(), // filter to specific types
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { results: [] };
        const searchTerm = `%${input.term}%`;
        const results: Array<{ type: string; id: number; title: string; subtitle?: string }> = [];

        // Search contracts
        if (!input.types || input.types.includes("contract")) {
          const contractResults = await db.select().from(contracts)
            .where(and(eq(contracts.workspaceId, input.workspaceId), like(contracts.title, searchTerm)))
            .limit(10);
          results.push(...contractResults.map(c => ({ type: "contract", id: c.id, title: c.title, subtitle: c.contractNumber || undefined })));
        }

        // Search opportunities
        if (!input.types || input.types.includes("opportunity")) {
          const oppResults = await db.select().from(opportunities)
            .where(and(eq(opportunities.workspaceId, input.workspaceId), like(opportunities.title, searchTerm)))
            .limit(10);
          results.push(...oppResults.map(o => ({ type: "opportunity", id: o.id, title: o.title, subtitle: o.agency || undefined })));
        }

        // Search proposals
        if (!input.types || input.types.includes("proposal")) {
          const propResults = await db.select().from(proposals)
            .where(and(eq(proposals.workspaceId, input.workspaceId), like(proposals.title, searchTerm)))
            .limit(10);
          results.push(...propResults.map(p => ({ type: "proposal", id: p.id, title: p.title })));
        }

        // Search tasks
        if (!input.types || input.types.includes("task")) {
          const taskResults = await db.select().from(tasks)
            .where(and(eq(tasks.workspaceId, input.workspaceId), like(tasks.title, searchTerm)))
            .limit(10);
          results.push(...taskResults.map(t => ({ type: "task", id: t.id, title: t.title })));
        }

        // Search files
        if (!input.types || input.types.includes("file")) {
          const fileResults = await db.select().from(files)
            .where(and(eq(files.workspaceId, input.workspaceId), like(files.fileName, searchTerm)))
            .limit(10);
          results.push(...fileResults.map(f => ({ type: "file", id: f.id, title: f.fileName })));
        }

        return { results };
      }),
  }),

  // ============================================================
  // Contract Health Score
  // ============================================================
  health: router({
    contractScore: protectedProcedure
      .input(z.object({ contractId: z.number(), workspaceId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { score: 0, factors: [] };

        const factors: Array<{ name: string; status: "good" | "warning" | "critical"; detail: string }> = [];
        let score = 100;

        // Check for overdue tasks
        const overdueTasks = await db.select({ count: count() }).from(tasks)
          .where(and(
            eq(tasks.workspaceId, input.workspaceId),
            eq(tasks.relatedRecordType, "contract"),
            eq(tasks.relatedRecordId, input.contractId),
            eq(tasks.status, "overdue")
          ));
        const overdueCount = overdueTasks[0]?.count || 0;
        if (overdueCount > 0) {
          score -= Math.min(30, overdueCount * 10);
          factors.push({ name: "Overdue Tasks", status: overdueCount > 2 ? "critical" : "warning", detail: `${overdueCount} overdue task(s)` });
        } else {
          factors.push({ name: "Tasks", status: "good", detail: "All tasks on track" });
        }

        // Check for unreviewed AI findings
        const unreviewedFindings = await db.select({ count: count() }).from(aiFindings)
          .where(and(
            eq(aiFindings.workspaceId, input.workspaceId),
            eq(aiFindings.contractId, input.contractId),
            eq(aiFindings.reviewState, "unreviewed")
          ));
        const unreviewedCount = unreviewedFindings[0]?.count || 0;
        if (unreviewedCount > 0) {
          score -= Math.min(20, unreviewedCount * 5);
          factors.push({ name: "Unreviewed Findings", status: unreviewedCount > 3 ? "critical" : "warning", detail: `${unreviewedCount} finding(s) need review` });
        } else {
          factors.push({ name: "AI Findings", status: "good", detail: "All findings reviewed" });
        }

        // Check for pending invoices
        const pendingInvoices = await db.select({ count: count() }).from(invoices)
          .where(and(
            eq(invoices.workspaceId, input.workspaceId),
            eq(invoices.contractId, input.contractId),
            eq(invoices.status, "pending")
          ));
        const pendingCount = pendingInvoices[0]?.count || 0;
        if (pendingCount > 0) {
          score -= Math.min(15, pendingCount * 5);
          factors.push({ name: "Pending Invoices", status: pendingCount > 2 ? "warning" : "warning", detail: `${pendingCount} invoice(s) pending` });
        } else {
          factors.push({ name: "Invoicing", status: "good", detail: "All invoices processed" });
        }

        return { score: Math.max(0, score), factors };
      }),

    workspaceOverview: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { contracts: [], averageScore: 0 };

        const allContracts = await db.select().from(contracts)
          .where(eq(contracts.workspaceId, input.workspaceId));

        // Simple overview without individual health calculations
        return {
          contracts: allContracts.map(c => ({
            id: c.id,
            title: c.title,
            status: c.status,
            healthScore: c.healthScore || 75,
          })),
          averageScore: allContracts.length > 0
            ? Math.round(allContracts.reduce((sum, c) => sum + (c.healthScore || 75), 0) / allContracts.length)
            : 0,
        };
      }),
  }),

  // ============================================================
  // Archive / Soft Delete
  // ============================================================
  archive: router({
    archiveRecord: protectedProcedure
      .input(z.object({
        recordType: z.enum(["opportunity", "proposal", "contract", "file", "contact", "invoice", "task"]),
        recordId: z.number(),
        workspaceId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { success: false };

        const tableMap: Record<string, any> = {
          opportunity: opportunities,
          proposal: proposals,
          contract: contracts,
          file: files,
          invoice: invoices,
          task: tasks,
        };

        const table = tableMap[input.recordType];
        if (!table) return { success: false };

        await db.update(table).set({ archivedAt: new Date() } as any)
          .where(and(eq(table.id, input.recordId), eq(table.workspaceId, input.workspaceId)));

        await logAuditEvent({
          workspaceId: input.workspaceId,
          userId: ctx.user.id,
          actionType: "archive",
          targetType: input.recordType,
          targetId: input.recordId,
        });

        return { success: true };
      }),

    restoreRecord: protectedProcedure
      .input(z.object({
        recordType: z.enum(["opportunity", "proposal", "contract", "file", "contact", "invoice", "task"]),
        recordId: z.number(),
        workspaceId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { success: false };

        const tableMap: Record<string, any> = {
          opportunity: opportunities,
          proposal: proposals,
          contract: contracts,
          file: files,
          invoice: invoices,
          task: tasks,
        };

        const table = tableMap[input.recordType];
        if (!table) return { success: false };

        await db.update(table).set({ archivedAt: null } as any)
          .where(and(eq(table.id, input.recordId), eq(table.workspaceId, input.workspaceId)));

        await logAuditEvent({
          workspaceId: input.workspaceId,
          userId: ctx.user.id,
          actionType: "restore",
          targetType: input.recordType,
          targetId: input.recordId,
        });

        return { success: true };
      }),
  }),

  // ============================================================
  // System Errors
  // ============================================================
  errors: router({
    log: protectedProcedure
      .input(z.object({
        errorType: z.string(),
        route: z.string().optional(),
        message: z.string(),
        stackTrace: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db.insert(systemErrors).values({
          ...input,
          userId: ctx.user.id,
        });
        return { success: true };
      }),
  }),
});

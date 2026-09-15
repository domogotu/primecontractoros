// @ts-nocheck
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
import { TRPCError } from "@trpc/server";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { getDb } from "./db";
import { auditLogs, notifications, systemErrors, workspaceRoles, contracts, opportunities, proposals, tasks, invoices, files, aiFindings, supportTickets } from "../drizzle/schema";
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

async function requireActiveWorkspace(ctx: any, requestedWorkspaceId?: number): Promise<number> {
  if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
  const workspaceId = await requireWorkspaceId(ctx.user.id);
  if (requestedWorkspaceId !== undefined && requestedWorkspaceId !== workspaceId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Workspace access denied" });
  }
  return workspaceId;
}

async function requireSupportTicketInWorkspace(ticketId: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [ticket] = await db.select().from(supportTickets)
    .where(and(eq(supportTickets.id, ticketId), eq(supportTickets.workspaceId, workspaceId)))
    .limit(1);
  if (!ticket) throw new TRPCError({ code: "NOT_FOUND", message: "Support ticket not found" });
  return ticket;
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
      .query(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
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
      .query(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
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
      .mutation(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const db = await getDb();
        if (!db) return { success: false };
        const tenantWorkspaceId = await requireActiveWorkspace(ctx);
        await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.id, input.notificationId), eq(notifications.workspaceId, tenantWorkspaceId)));
        return { success: true };
      }),

    markAllRead: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const db = await getDb();
        if (!db) return { success: false };
        await db.update(notifications).set({ isRead: true }).where(eq(notifications.workspaceId, input.workspaceId));
        return { success: true };
      }),

    dismiss: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const db = await getDb();
        if (!db) return { success: false };
        const tenantWorkspaceId = await requireActiveWorkspace(ctx);
        await db.update(notifications).set({ dismissedAt: new Date() }).where(and(eq(notifications.id, input.notificationId), eq(notifications.workspaceId, tenantWorkspaceId)));
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
      .query(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
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
            .where(and(eq(files.workspaceId, input.workspaceId), like(files.name, searchTerm)))
            .limit(10);
          results.push(...fileResults.map(f => ({ type: "file", id: f.id, title: f.name })));
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
      .query(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const db = await getDb();
        if (!db) return { score: 0, factors: [] };

        const factors: Array<{ name: string; status: "good" | "warning" | "critical"; detail: string }> = [];
        let score = 100;

        // Check for overdue tasks
        const overdueTasks = await db.select({ count: count() }).from(tasks)
          .where(and(
            eq(tasks.workspaceId, input.workspaceId),
            eq(tasks.linkedRecordType, "contract"),
            eq(tasks.linkedRecordId, input.contractId),
            eq(tasks.status, "todo")
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
      .query(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const db = await getDb();
        if (!db) return { contracts: [], averageScore: 0 };

        const allContracts = await db.select().from(contracts)
          .where(eq(contracts.workspaceId, input.workspaceId));

        // Simple overview without individual health calculations
        const healthMap: Record<string, number> = { healthy: 90, at_risk: 50, warning: 30 };
        return {
          contracts: allContracts.map(c => ({
            id: c.id,
            title: c.title,
            status: c.status,
            healthScore: healthMap[c.health || 'healthy'] || 75,
          })),
          averageScore: allContracts.length > 0
            ? Math.round(allContracts.reduce((sum, c) => sum + (healthMap[c.health || 'healthy'] || 75), 0) / allContracts.length)
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
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
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
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
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
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const db = await getDb();
        if (!db) return { success: false };
        await db.insert(systemErrors).values({
          ...input,
          userId: ctx.user.id,
        });
        return { success: true };
      }),
  }),

  // ============================================================
  // Export System — CSV/JSON export for all record types
  // ============================================================
  exports: router({
    generate: protectedProcedure
      .input(z.object({
        workspaceId: z.number(),
        recordType: z.enum(["opportunity", "proposal", "contract", "file", "contact", "invoice", "task", "ai_finding"]),
        format: z.enum(["csv", "json"]),
        filters: z.object({
          status: z.string().optional(),
          dateFrom: z.string().optional(),
          dateTo: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const db = await getDb();
        if (!db) return { success: false, data: "" };
        const tableMap: Record<string, any> = {
          opportunity: opportunities,
          proposal: proposals,
          contract: contracts,
          file: files,
          invoice: invoices,
          task: tasks,
          ai_finding: aiFindings,
        };
        const table = tableMap[input.recordType];
        if (!table) return { success: false, data: "" };
        const rows = await db.select().from(table)
          .where(eq(table.workspaceId, input.workspaceId))
          .limit(1000);
        if (input.format === "json") {
          return { success: true, data: JSON.stringify(rows, null, 2), filename: `${input.recordType}_export.json` };
        }
        // CSV format
        if (rows.length === 0) return { success: true, data: "", filename: `${input.recordType}_export.csv` };
        const headers = Object.keys(rows[0]);
        const csvRows = [headers.join(",")];
        for (const row of rows) {
          csvRows.push(headers.map(h => {
            const val = (row as any)[h];
            if (val === null || val === undefined) return "";
            const str = String(val);
            return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
          }).join(","));
        }
        return { success: true, data: csvRows.join("\n"), filename: `${input.recordType}_export.csv` };
      }),
  }),

  // ============================================================
  // Import System — CSV import with preview
  // ============================================================
  imports: router({
    preview: protectedProcedure
      .input(z.object({
        csvContent: z.string(),
        recordType: z.enum(["contact", "opportunity", "contract", "invoice"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const lines = input.csvContent.trim().split("\n");
        if (lines.length < 2) return { headers: [] as string[], rows: [] as Record<string, string>[], totalRows: 0 };
        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
        const rows = lines.slice(1, 11).map(line => {
          const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
          const row: Record<string, string> = {};
          headers.forEach((h, i) => { row[h] = values[i] || ""; });
          return row;
        });
        return { headers, rows, totalRows: lines.length - 1 };
      }),
    execute: protectedProcedure
      .input(z.object({
        workspaceId: z.number(),
        csvContent: z.string(),
        recordType: z.enum(["contact", "opportunity", "contract", "invoice"]),
        fieldMapping: z.record(z.string(), z.string()),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const db = await getDb();
        if (!db) return { success: false, imported: 0 };
        const lines = input.csvContent.trim().split("\n");
        if (lines.length < 2) return { success: false, imported: 0 };
        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
        let imported = 0;
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
          const row: Record<string, any> = { workspaceId: input.workspaceId };
          headers.forEach((h, idx) => {
            const targetField = input.fieldMapping[h];
            if (targetField) row[targetField] = values[idx] || null;
          });
          try {
            const tableMap: Record<string, any> = {
              opportunity: opportunities,
              contract: contracts,
              invoice: invoices,
            };
            const table = tableMap[input.recordType];
            if (table) {
              await db.insert(table).values(row);
              imported++;
            }
          } catch { /* skip invalid rows */ }
        }
        await logAuditEvent({
          workspaceId: input.workspaceId,
          userId: ctx.user.id,
          actionType: "import",
          targetType: input.recordType,
          targetId: 0,
          newValue: `Imported ${imported} records`,
        });
        return { success: true, imported };
      }),
  }),

  // ============================================================
  // AI Cost and Usage Controls
  // ============================================================
  aiControls: router({
    getSettings: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        return {
          enabled: true,
          monthlyCapUsd: 50.00,
          currentMonthUsageUsd: 0,
          maxRunsPerDay: 100,
          todayRuns: 0,
          allowedFeatures: ["contract_scan", "opportunity_review", "proposal_review", "file_analysis", "invoice_review", "workspace_summary"],
        };
      }),
    updateSettings: protectedProcedure
      .input(z.object({
        workspaceId: z.number(),
        enabled: z.boolean().optional(),
        monthlyCapUsd: z.number().optional(),
        maxRunsPerDay: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        await logAuditEvent({
          workspaceId: input.workspaceId,
          userId: ctx.user.id,
          actionType: "update",
          targetType: "ai_settings",
          targetId: input.workspaceId,
          newValue: JSON.stringify(input),
        });
        return { success: true };
      }),
  }),

  // ============================================================
  // Workspace Setup Completeness Score
  // ============================================================
  workspaceCompleteness: router({
    getScore: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const db = await getDb();
        if (!db) return { score: 0, total: 8, completed: 0, items: [] };
        const items: { name: string; complete: boolean; weight: number }[] = [];
        // Check if they have any records
        const [oppCount] = await db.select({ count: count() }).from(opportunities)
          .where(eq(opportunities.workspaceId, input.workspaceId));
        items.push({ name: "First opportunity added", complete: (oppCount?.count || 0) > 0, weight: 1 });
        const [contractCount] = await db.select({ count: count() }).from(contracts)
          .where(eq(contracts.workspaceId, input.workspaceId));
        items.push({ name: "First contract added", complete: (contractCount?.count || 0) > 0, weight: 1 });
        const [fileCount] = await db.select({ count: count() }).from(files)
          .where(eq(files.workspaceId, input.workspaceId));
        items.push({ name: "First file uploaded", complete: (fileCount?.count || 0) > 0, weight: 1 });
        const [taskCount] = await db.select({ count: count() }).from(tasks)
          .where(eq(tasks.workspaceId, input.workspaceId));
        items.push({ name: "First task created", complete: (taskCount?.count || 0) > 0, weight: 1 });
        const [invoiceCount] = await db.select({ count: count() }).from(invoices)
          .where(eq(invoices.workspaceId, input.workspaceId));
        items.push({ name: "First invoice created", complete: (invoiceCount?.count || 0) > 0, weight: 1 });
        const [findingCount] = await db.select({ count: count() }).from(aiFindings)
          .where(eq(aiFindings.workspaceId, input.workspaceId));
        items.push({ name: "First AI scan run", complete: (findingCount?.count || 0) > 0, weight: 1 });
        const completedCount = items.filter(i => i.complete).length;
        const score = Math.round((completedCount / items.length) * 100);
        return { score, total: items.length, completed: completedCount, items };
      }),
  }),

  // ============================================================
  // Support System
  // ============================================================
  support: router({
    list: protectedProcedure
      .input(z.object({ workspaceId: z.number().optional(), status: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const db = await getDb();
        if (!db) return [];
        const tenantWorkspaceId = await requireActiveWorkspace(ctx, input?.workspaceId);
        const conditions: any[] = [eq(supportTickets.workspaceId, tenantWorkspaceId)];
                if (input?.status) conditions.push(eq(supportTickets.status, input.status as any));
        return db.select().from(supportTickets)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(supportTickets.createdAt))
          .limit(100);
      }),
    create: protectedProcedure
      .input(z.object({
        workspaceId: z.number(),
        subject: z.string(),
        body: z.string(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const db = await getDb();
        if (!db) return { success: false };
        await db.insert(supportTickets).values({
          ...input,
          userId: ctx.user.id,
        });
        await logAuditEvent({
          workspaceId: input.workspaceId,
          userId: ctx.user.id,
          actionType: "create",
          targetType: "support_ticket",
          targetId: 0,
        });
        return { success: true };
      }),
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["open", "in_progress", "waiting_on_customer", "resolved", "closed"]),
        resolution: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const db = await getDb();
        if (!db) return { success: false };
        const tenantWorkspaceId = await requireActiveWorkspace(ctx);
        await requireSupportTicketInWorkspace(input.id, tenantWorkspaceId);
        const updateData: any = { status: input.status };
        if (input.resolution) updateData.resolution = input.resolution;
        if (input.status === "resolved" || input.status === "closed") updateData.resolvedAt = new Date();
        await db.update(supportTickets).set(updateData).where(and(eq(supportTickets.id, input.id), eq(supportTickets.workspaceId, tenantWorkspaceId)));
        return { success: true };
      }),
    addNote: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        note: z.string(),
        isInternal: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const tenantWorkspaceId = await requireActiveWorkspace(ctx);
        await requireSupportTicketInWorkspace(input.ticketId, tenantWorkspaceId);
        await logAuditEvent({
          workspaceId: tenantWorkspaceId,
          userId: ctx.user.id,
          actionType: "note",
          targetType: "support_ticket",
          targetId: input.ticketId,
          newValue: input.note,
          reason: input.isInternal ? "internal" : "reply",
        });
        return { success: true };
      }),
  }),
});

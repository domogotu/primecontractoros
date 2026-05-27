import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { logAudit } from "./featureRouter";
import { getDb } from "./db";
import { and, eq, desc, like, or, sql } from "drizzle-orm";
import {
  farDfarsClauses, farDfarsBookmarks, farDfarsClauseLinks,
  farDfarsClauseNotes, farDfarsFlowdownReviews, farDfarsSourceMatches,
  farDfarsReviewEvents, farDfarsSavedViews, farDfarsClauseLifecycle,
  farDfarsExports
} from "../drizzle/schema";

async function getWorkspaceId(ctx: any): Promise<number> {
  if (!ctx.user?.id) throw new Error("Not authenticated");
  return requireWorkspaceId(ctx.user.id);
}

export const farDfarsRouter = router({
  // ==================== CLAUSES ====================
  listClauses: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      sourceType: z.string().optional(),
      category: z.string().optional(),
      farPart: z.string().optional(),
      bookmarkedOnly: z.boolean().optional(),
      flowdownWatch: z.boolean().optional(),
      cybersecurityWatch: z.boolean().optional(),
      smallBusinessWatch: z.boolean().optional(),
      paymentWatch: z.boolean().optional(),
      includeCustom: z.boolean().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const wsId = await getWorkspaceId(ctx);
      
      const conditions: any[] = [
        or(
          eq(farDfarsClauses.isGlobal, true),
          eq(farDfarsClauses.workspaceId, wsId)
        )
      ];

      if (input?.sourceType && input.sourceType !== "all") {
        conditions.push(eq(farDfarsClauses.sourceType, input.sourceType as any));
      }
      if (input?.category && input.category !== "all") {
        conditions.push(eq(farDfarsClauses.category, input.category));
      }
      if (input?.farPart && input.farPart !== "all") {
        conditions.push(eq(farDfarsClauses.farPart, input.farPart));
      }
      if (input?.flowdownWatch) {
        conditions.push(eq(farDfarsClauses.flowdownWatch, true));
      }
      if (input?.cybersecurityWatch) {
        conditions.push(eq(farDfarsClauses.cybersecurityWatch, true));
      }
      if (input?.smallBusinessWatch) {
        conditions.push(eq(farDfarsClauses.smallBusinessWatch, true));
      }
      if (input?.paymentWatch) {
        conditions.push(eq(farDfarsClauses.paymentWatch, true));
      }
      if (input?.search) {
        const searchTerm = `%${input.search}%`;
        conditions.push(
          or(
            like(farDfarsClauses.clauseNumber, searchTerm),
            like(farDfarsClauses.title, searchTerm),
            like(farDfarsClauses.summary, searchTerm),
            like(farDfarsClauses.category, searchTerm),
            like(farDfarsClauses.tags, searchTerm)
          )
        );
      }

      const clauses = await db.select().from(farDfarsClauses)
        .where(and(...conditions))
        .orderBy(farDfarsClauses.clauseNumber);

      return clauses;
    }),

  getClause: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const [clause] = await db.select().from(farDfarsClauses)
        .where(eq(farDfarsClauses.id, input.id))
        .limit(1);
      return clause || null;
    }),

  createCustomClause: protectedProcedure
    .input(z.object({
      clauseNumber: z.string(),
      title: z.string(),
      sourceType: z.string().default("FAR"),
      farPart: z.string().optional(),
      category: z.string().optional(),
      summary: z.string().optional(),
      plainLanguageMeaning: z.string().optional(),
      whyItMatters: z.string().optional(),
      applicabilityNote: z.string().optional(),
      officialSourceUrl: z.string().optional(),
      tags: z.string().optional(),
      flowdownWatch: z.boolean().optional(),
      cybersecurityWatch: z.boolean().optional(),
      smallBusinessWatch: z.boolean().optional(),
      paymentWatch: z.boolean().optional(),
      subcontractingWatch: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const wsId = await getWorkspaceId(ctx);
      const result = await db.insert(farDfarsClauses).values({
        ...input,
        sourceType: input.sourceType as any,
        isCustom: true,
        isGlobal: false,
        workspaceId: wsId,
      } as any);
      try { await logAudit(wsId, ctx.user.id, "create", "far_dfars_clause", 0, input); } catch {}
      await db.insert(farDfarsReviewEvents).values({
        workspaceId: wsId,
        clauseId: result[0].insertId,
        action: "custom_clause_created",
        newStatus: "needs_review",
        reviewerUserId: ctx.user.id,
      } as any);
      return { id: result[0].insertId };
    }),

  updateCustomClause: protectedProcedure
    .input(z.object({
      id: z.number(),
      clauseNumber: z.string().optional(),
      title: z.string().optional(),
      sourceType: z.string().optional(),
      farPart: z.string().optional(),
      category: z.string().optional(),
      summary: z.string().optional(),
      plainLanguageMeaning: z.string().optional(),
      whyItMatters: z.string().optional(),
      applicabilityNote: z.string().optional(),
      officialSourceUrl: z.string().optional(),
      tags: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const wsId = await getWorkspaceId(ctx);
      const { id, ...data } = input;
      await db.update(farDfarsClauses).set(data as any)
        .where(and(eq(farDfarsClauses.id, id), eq(farDfarsClauses.workspaceId, wsId)));
      try { await logAudit(wsId, ctx.user.id, "update", "far_dfars_clause", id, input); } catch {}
      return { success: true };
    }),

  // ==================== BOOKMARKS ====================
  listBookmarks: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const wsId = await getWorkspaceId(ctx);
      return db.select().from(farDfarsBookmarks)
        .where(and(eq(farDfarsBookmarks.workspaceId, wsId), eq(farDfarsBookmarks.userId, ctx.user.id)));
    }),

  toggleBookmark: protectedProcedure
    .input(z.object({ clauseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const wsId = await getWorkspaceId(ctx);
      const existing = await db.select().from(farDfarsBookmarks)
        .where(and(
          eq(farDfarsBookmarks.workspaceId, wsId),
          eq(farDfarsBookmarks.userId, ctx.user.id),
          eq(farDfarsBookmarks.clauseId, input.clauseId)
        )).limit(1);
      
      if (existing.length > 0) {
        await db.delete(farDfarsBookmarks).where(eq(farDfarsBookmarks.id, existing[0].id));
        try { await logAudit(wsId, ctx.user.id, "delete", "far_dfars_bookmark", input.clauseId, null); } catch {}
        return { bookmarked: false };
      } else {
        await db.insert(farDfarsBookmarks).values({
          workspaceId: wsId,
          userId: ctx.user.id,
          clauseId: input.clauseId,
        });
        try { await logAudit(wsId, ctx.user.id, "create", "far_dfars_bookmark", input.clauseId, null); } catch {}
        return { bookmarked: true };
      }
    }),

  // ==================== CLAUSE LINKS ====================
  listClauseLinks: protectedProcedure
    .input(z.object({ clauseId: z.number().optional(), contractId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const wsId = await getWorkspaceId(ctx);
      const conditions: any[] = [eq(farDfarsClauseLinks.workspaceId, wsId)];
      if (input?.clauseId) conditions.push(eq(farDfarsClauseLinks.clauseId, input.clauseId));
      if (input?.contractId) conditions.push(eq(farDfarsClauseLinks.contractId, input.contractId));
      return db.select().from(farDfarsClauseLinks)
        .where(and(...conditions))
        .orderBy(desc(farDfarsClauseLinks.createdAt));
    }),

  createClauseLink: protectedProcedure
    .input(z.object({
      clauseId: z.number(),
      linkedRecordType: z.string(),
      linkedRecordId: z.number().optional(),
      contractId: z.number().optional(),
      sourceFileId: z.number().optional(),
      sourceLocation: z.string().optional(),
      relevanceStatus: z.string().optional(),
      sourceStrength: z.string().optional(),
      note: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const wsId = await getWorkspaceId(ctx);
      const result = await db.insert(farDfarsClauseLinks).values({
        ...input,
        workspaceId: wsId,
        createdBy: ctx.user.id,
        reviewStatus: "pending",
      } as any);
      await db.insert(farDfarsReviewEvents).values({
        workspaceId: wsId,
        clauseId: input.clauseId,
        linkedRecordType: input.linkedRecordType,
        linkedRecordId: input.linkedRecordId,
        action: "clause_linked",
        newStatus: input.relevanceStatus || "reference_only",
        reviewerUserId: ctx.user.id,
      } as any);
      try { await logAudit(wsId, ctx.user.id, "create", "far_dfars_link", 0, input); } catch {}
      return { id: result[0].insertId };
    }),

  updateClauseLink: protectedProcedure
    .input(z.object({
      id: z.number(),
      relevanceStatus: z.string().optional(),
      reviewStatus: z.string().optional(),
      sourceStrength: z.string().optional(),
      note: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const wsId = await getWorkspaceId(ctx);
      const { id, ...data } = input;
      await db.update(farDfarsClauseLinks).set(data as any)
        .where(and(eq(farDfarsClauseLinks.id, id), eq(farDfarsClauseLinks.workspaceId, wsId)));
      try { await logAudit(wsId, ctx.user.id, "update", "far_dfars_link", id, input); } catch {}
      return { success: true };
    }),

  deleteClauseLink: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const wsId = await getWorkspaceId(ctx);
      await db.delete(farDfarsClauseLinks)
        .where(and(eq(farDfarsClauseLinks.id, input.id), eq(farDfarsClauseLinks.workspaceId, wsId)));
      try { await logAudit(wsId, ctx.user.id, "delete", "far_dfars_link", input.id, null); } catch {}
      return { success: true };
    }),

  // ==================== NOTES ====================
  listNotes: protectedProcedure
    .input(z.object({ clauseId: z.number(), contractId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const wsId = await getWorkspaceId(ctx);
      const conditions: any[] = [eq(farDfarsClauseNotes.workspaceId, wsId)];
      if (input?.clauseId) conditions.push(eq(farDfarsClauseNotes.clauseId, input.clauseId));
      if (input?.contractId) conditions.push(eq(farDfarsClauseNotes.contractId, input.contractId));
      return db.select().from(farDfarsClauseNotes)
        .where(and(...conditions))
        .orderBy(desc(farDfarsClauseNotes.createdAt));
    }),

  createNote: protectedProcedure
    .input(z.object({
      clauseId: z.number(),
      contractId: z.number().optional(),
      noteType: z.string().default("internal"),
      noteText: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const wsId = await getWorkspaceId(ctx);
      const result = await db.insert(farDfarsClauseNotes).values({
        ...input,
        workspaceId: wsId,
        createdBy: ctx.user.id,
        reviewStatus: "draft",
      } as any);
      try { await logAudit(wsId, ctx.user.id, "create", "far_dfars_note", 0, input); } catch {}
      return { id: result[0].insertId };
    }),

  updateNote: protectedProcedure
    .input(z.object({
      id: z.number(),
      noteText: z.string().optional(),
      reviewStatus: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const wsId = await getWorkspaceId(ctx);
      const { id, ...data } = input;
      await db.update(farDfarsClauseNotes).set(data as any)
        .where(and(eq(farDfarsClauseNotes.id, id), eq(farDfarsClauseNotes.workspaceId, wsId)));
      return { success: true };
    }),

  // ==================== FLOWDOWN REVIEWS ====================
  listFlowdownReviews: protectedProcedure
    .input(z.object({ clauseId: z.number().optional(), contractId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const wsId = await getWorkspaceId(ctx);
      const conditions: any[] = [eq(farDfarsFlowdownReviews.workspaceId, wsId)];
      if (input?.clauseId) conditions.push(eq(farDfarsFlowdownReviews.clauseId, input.clauseId));
      if (input?.contractId) conditions.push(eq(farDfarsFlowdownReviews.contractId, input.contractId));
      return db.select().from(farDfarsFlowdownReviews)
        .where(and(...conditions))
        .orderBy(desc(farDfarsFlowdownReviews.createdAt));
    }),

  createFlowdownReview: protectedProcedure
    .input(z.object({
      clauseId: z.number(),
      contractId: z.number().optional(),
      subcontractorContactId: z.number().optional(),
      flowdownStatus: z.string().default("not_started"),
      limitationWatch: z.boolean().optional(),
      subcontractingPlanWatch: z.boolean().optional(),
      consentWatch: z.boolean().optional(),
      cybersecurityFlowdownWatch: z.boolean().optional(),
      paymentFlowdownWatch: z.boolean().optional(),
      laborFlowdownWatch: z.boolean().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const wsId = await getWorkspaceId(ctx);
      const result = await db.insert(farDfarsFlowdownReviews).values({
        ...input,
        workspaceId: wsId,
        reviewedBy: ctx.user.id,
      } as any);
      await db.insert(farDfarsReviewEvents).values({
        workspaceId: wsId,
        clauseId: input.clauseId,
        action: "flowdown_review_started",
        newStatus: input.flowdownStatus,
        reviewerUserId: ctx.user.id,
      } as any);
      try { await logAudit(wsId, ctx.user.id, "create", "far_dfars_flowdown", 0, input); } catch {}
      return { id: result[0].insertId };
    }),

  updateFlowdownReview: protectedProcedure
    .input(z.object({
      id: z.number(),
      flowdownStatus: z.string().optional(),
      limitationWatch: z.boolean().optional(),
      subcontractingPlanWatch: z.boolean().optional(),
      consentWatch: z.boolean().optional(),
      cybersecurityFlowdownWatch: z.boolean().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const wsId = await getWorkspaceId(ctx);
      const { id, ...data } = input;
      await db.update(farDfarsFlowdownReviews).set(data as any)
        .where(and(eq(farDfarsFlowdownReviews.id, id), eq(farDfarsFlowdownReviews.workspaceId, wsId)));
      try { await logAudit(wsId, ctx.user.id, "update", "far_dfars_flowdown", id, input); } catch {}
      return { success: true };
    }),

  // ==================== SOURCE MATCHES ====================
  listSourceMatches: protectedProcedure
    .input(z.object({ clauseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const wsId = await getWorkspaceId(ctx);
      return db.select().from(farDfarsSourceMatches)
        .where(and(eq(farDfarsSourceMatches.workspaceId, wsId), eq(farDfarsSourceMatches.clauseId, input.clauseId)))
        .orderBy(desc(farDfarsSourceMatches.createdAt));
    }),

  createSourceMatch: protectedProcedure
    .input(z.object({
      clauseId: z.number(),
      sourceFileId: z.number().optional(),
      linkedRecordType: z.string().optional(),
      linkedRecordId: z.number().optional(),
      sourceLocation: z.string().optional(),
      extractedTextSnippet: z.string().optional(),
      extractionMethod: z.string().default("manual"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const wsId = await getWorkspaceId(ctx);
      const result = await db.insert(farDfarsSourceMatches).values({
        ...input,
        workspaceId: wsId,
        matchReviewStatus: "pending",
      } as any);
      try { await logAudit(wsId, ctx.user.id, "create", "far_dfars_source_match", 0, input); } catch {}
      return { id: result[0].insertId };
    }),

  // ==================== REVIEW EVENTS ====================
  listReviewEvents: protectedProcedure
    .input(z.object({ clauseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const wsId = await getWorkspaceId(ctx);
      return db.select().from(farDfarsReviewEvents)
        .where(and(eq(farDfarsReviewEvents.workspaceId, wsId), eq(farDfarsReviewEvents.clauseId, input.clauseId)))
        .orderBy(desc(farDfarsReviewEvents.createdAt));
    }),

  // ==================== SAVED VIEWS ====================
  listSavedViews: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const wsId = await getWorkspaceId(ctx);
      return db.select().from(farDfarsSavedViews)
        .where(and(eq(farDfarsSavedViews.workspaceId, wsId), eq(farDfarsSavedViews.userId, ctx.user.id)));
    }),

  createSavedView: protectedProcedure
    .input(z.object({
      name: z.string(),
      filters: z.string(),
      isDefault: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const wsId = await getWorkspaceId(ctx);
      const result = await db.insert(farDfarsSavedViews).values({
        ...input,
        workspaceId: wsId,
        userId: ctx.user.id,
      } as any);
      return { id: result[0].insertId };
    }),

  deleteSavedView: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const wsId = await getWorkspaceId(ctx);
      await db.delete(farDfarsSavedViews)
        .where(and(eq(farDfarsSavedViews.id, input.id), eq(farDfarsSavedViews.workspaceId, wsId)));
      return { success: true };
    }),

  // ==================== LIFECYCLE ====================
  getLifecycle: protectedProcedure
    .input(z.object({ clauseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const wsId = await getWorkspaceId(ctx);
      const [lifecycle] = await db.select().from(farDfarsClauseLifecycle)
        .where(and(eq(farDfarsClauseLifecycle.workspaceId, wsId), eq(farDfarsClauseLifecycle.clauseId, input.clauseId)))
        .limit(1);
      return lifecycle || null;
    }),

  updateLifecycle: protectedProcedure
    .input(z.object({
      clauseId: z.number(),
      lifecycleStatus: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const wsId = await getWorkspaceId(ctx);
      const existing = await db.select().from(farDfarsClauseLifecycle)
        .where(and(eq(farDfarsClauseLifecycle.workspaceId, wsId), eq(farDfarsClauseLifecycle.clauseId, input.clauseId)))
        .limit(1);
      
      if (existing.length > 0) {
        const oldStatus = existing[0].lifecycleStatus;
        await db.update(farDfarsClauseLifecycle).set({
          lifecycleStatus: input.lifecycleStatus,
          lastReviewedAt: new Date(),
          lastReviewedBy: ctx.user.id,
        } as any).where(eq(farDfarsClauseLifecycle.id, existing[0].id));
        await db.insert(farDfarsReviewEvents).values({
          workspaceId: wsId,
          clauseId: input.clauseId,
          action: "lifecycle_status_changed",
          oldStatus,
          newStatus: input.lifecycleStatus,
          reviewerUserId: ctx.user.id,
        } as any);
      } else {
        await db.insert(farDfarsClauseLifecycle).values({
          workspaceId: wsId,
          clauseId: input.clauseId,
          lifecycleStatus: input.lifecycleStatus,
          lastReviewedBy: ctx.user.id,
          lastReviewedAt: new Date(),
        } as any);
      }
      try { await logAudit(wsId, ctx.user.id, "update", "far_dfars_lifecycle", input.clauseId, input); } catch {}
      return { success: true };
    }),

  // ==================== STATS ====================
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { total: 0, bookmarked: 0, linkedToContracts: 0, complianceItems: 0, flowdownWatch: 0, needsReview: 0 };
      const wsId = await getWorkspaceId(ctx);
      
      const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(farDfarsClauses)
        .where(or(eq(farDfarsClauses.isGlobal, true), eq(farDfarsClauses.workspaceId, wsId)));
      
      const [bookmarkResult] = await db.select({ count: sql<number>`count(*)` }).from(farDfarsBookmarks)
        .where(and(eq(farDfarsBookmarks.workspaceId, wsId), eq(farDfarsBookmarks.userId, ctx.user.id)));
      
      const [linksResult] = await db.select({ count: sql<number>`count(*)` }).from(farDfarsClauseLinks)
        .where(and(eq(farDfarsClauseLinks.workspaceId, wsId), eq(farDfarsClauseLinks.linkedRecordType, "contract")));
      
      const [complianceResult] = await db.select({ count: sql<number>`count(*)` }).from(farDfarsClauseLinks)
        .where(and(eq(farDfarsClauseLinks.workspaceId, wsId), eq(farDfarsClauseLinks.linkedRecordType, "compliance")));
      
      const [flowdownResult] = await db.select({ count: sql<number>`count(*)` }).from(farDfarsFlowdownReviews)
        .where(eq(farDfarsFlowdownReviews.workspaceId, wsId));
      
      const [reviewResult] = await db.select({ count: sql<number>`count(*)` }).from(farDfarsClauseLinks)
        .where(and(eq(farDfarsClauseLinks.workspaceId, wsId), eq(farDfarsClauseLinks.reviewStatus, "pending")));

      return {
        total: Number(totalResult?.count || 0),
        bookmarked: Number(bookmarkResult?.count || 0),
        linkedToContracts: Number(linksResult?.count || 0),
        complianceItems: Number(complianceResult?.count || 0),
        flowdownWatch: Number(flowdownResult?.count || 0),
        needsReview: Number(reviewResult?.count || 0),
      };
    }),

  // ==================== CREATE TASK FROM CLAUSE ====================
  createTaskFromClause: protectedProcedure
    .input(z.object({
      clauseId: z.number(),
      contractId: z.number().optional(),
      title: z.string(),
      description: z.string().optional(),
      priority: z.string().default("medium"),
      dueDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const wsId = await getWorkspaceId(ctx);
      const { tasks } = await import("../drizzle/schema");
      const result = await db.insert(tasks).values({
        workspaceId: wsId,
        title: input.title,
        description: input.description || `Task created from FAR/DFARS clause reference.`,
        linkedRecordType: "far_dfars_clause",
        linkedRecordId: input.clauseId,
        priority: input.priority as any,
        status: "todo" as any,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      } as any);
      await db.insert(farDfarsReviewEvents).values({
        workspaceId: wsId,
        clauseId: input.clauseId,
        action: "task_created",
        newStatus: "todo",
        reviewerUserId: ctx.user.id,
      } as any);
      try { await logAudit(wsId, ctx.user.id, "create", "task_from_clause", 0, input); } catch {}
      return { id: result[0].insertId };
    }),

  // ==================== CREATE COMPLIANCE ITEM FROM CLAUSE ====================
  createComplianceItemFromClause: protectedProcedure
    .input(z.object({
      clauseId: z.number(),
      contractId: z.number().optional(),
      title: z.string(),
      description: z.string().optional(),
      priority: z.string().default("medium"),
      dueDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const wsId = await getWorkspaceId(ctx);
      const { complianceItems } = await import("../drizzle/schema");
      const result = await db.insert(complianceItems).values({
        workspaceId: wsId,
        title: input.title,
        description: input.description || `Compliance item created from FAR/DFARS clause reference. Status: Draft / Needs Contract Source Review.`,
        regulation: `${input.clauseId}`,
        category: "compliance",
        status: "pending_review" as any,
      } as any);
      // Also create a link
      await db.insert(farDfarsClauseLinks).values({
        workspaceId: wsId,
        clauseId: input.clauseId,
        linkedRecordType: "compliance",
        linkedRecordId: result[0].insertId,
        contractId: input.contractId,
        relevanceStatus: "needs_review",
        reviewStatus: "pending",
        createdBy: ctx.user.id,
      } as any);
      await db.insert(farDfarsReviewEvents).values({
        workspaceId: wsId,
        clauseId: input.clauseId,
        action: "compliance_item_created",
        newStatus: "draft",
        reviewerUserId: ctx.user.id,
      } as any);
      try { await logAudit(wsId, ctx.user.id, "create", "compliance_from_clause", 0, input); } catch {}
      return { id: result[0].insertId };
    }),

  // ==================== EXPORT ====================
  exportClauses: protectedProcedure
    .input(z.object({
      exportType: z.string(),
      filters: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const wsId = await getWorkspaceId(ctx);
      const result = await db.insert(farDfarsExports).values({
        workspaceId: wsId,
        exportType: input.exportType,
        filtersUsed: input.filters,
        createdBy: ctx.user.id,
      } as any);
      try { await logAudit(wsId, ctx.user.id, "create", "far_dfars_export", 0, input); } catch {}
      return { id: result[0].insertId, message: "Export initiated" };
    }),
});

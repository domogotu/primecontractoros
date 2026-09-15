import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb, getInsertId } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  contextualHelpItems,
  lifecycleStatusHistory,
  autoPopulationEvents,
  sourceReferences,
  templateImprovementSuggestions,
  helpArticles,
  glossaryTerms,
  aiSuggestions,
  aiFindings,
  aiRuns,
  tasks,
  opportunities,
  proposals,
  contracts,
  invoices,
  payments,
  deliverables,
  deadlines,
  complianceItems,
  closeoutBlockingItems,
  lessonsLearned,
  businessProfiles,
  files,
  contractRequirements,
  invoiceChecklistItems,
} from "../drizzle/schema";
import { requireWorkspaceId } from "./workspaceMiddleware";

// ==================== CONTEXTUAL HELP ROUTER ====================
export const contextualHelpRouter = router({
  getForPage: protectedProcedure
    .input(z.object({ pageKey: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(contextualHelpItems)
        .where(and(eq(contextualHelpItems.pageKey, input.pageKey), eq(contextualHelpItems.isActive, true)));
    }),
});

// ==================== LIFECYCLE STATUS HISTORY ROUTER ====================
export const lifecycleRouter = router({
  getHistory: protectedProcedure
    .input(z.object({ recordType: z.string(), recordId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      return db
        .select()
        .from(lifecycleStatusHistory)
        .where(
          and(
            eq(lifecycleStatusHistory.workspaceId, workspaceId),
            eq(lifecycleStatusHistory.recordType, input.recordType),
            eq(lifecycleStatusHistory.recordId, input.recordId)
          )
        )
        .orderBy(desc(lifecycleStatusHistory.changedAt));
    }),

  recordChange: protectedProcedure
    .input(
      z.object({
        recordType: z.string(),
        recordId: z.number(),
        previousStatus: z.string().nullable().optional(),
        newStatus: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      await db.insert(lifecycleStatusHistory).values({
        workspaceId,
        recordType: input.recordType,
        recordId: input.recordId,
        previousStatus: input.previousStatus || null,
        newStatus: input.newStatus,
        reason: input.reason || null,
        changedBy: ctx.user.id,
      });
      return { success: true };
    }),
});

// ==================== AUTO-POPULATION ROUTER ====================
export const autoPopulationRouter = router({
  getEvents: protectedProcedure
    .input(z.object({ targetRecordType: z.string(), targetRecordId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      return db
        .select()
        .from(autoPopulationEvents)
        .where(
          and(
            eq(autoPopulationEvents.workspaceId, workspaceId),
            eq(autoPopulationEvents.targetRecordType, input.targetRecordType),
            eq(autoPopulationEvents.targetRecordId, input.targetRecordId)
          )
        )
        .orderBy(desc(autoPopulationEvents.createdAt));
    }),

  recordEvent: protectedProcedure
    .input(
      z.object({
        targetRecordType: z.string(),
        targetRecordId: z.number(),
        sourceRecordType: z.string(),
        sourceRecordId: z.number(),
        fieldsApplied: z.any(),
        fieldsSkipped: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      await db.insert(autoPopulationEvents).values({
        workspaceId,
        targetRecordType: input.targetRecordType,
        targetRecordId: input.targetRecordId,
        sourceRecordType: input.sourceRecordType,
        sourceRecordId: input.sourceRecordId,
        fieldsApplied: input.fieldsApplied,
        fieldsSkipped: input.fieldsSkipped || null,
        reviewedBy: ctx.user.id,
        reviewedAt: new Date(),
      });
      return { success: true };
    }),

  // Get auto-fill preview data from business profile
  getBusinessProfileAutoFill: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const [profile] = await db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.workspaceId, workspaceId))
      .limit(1);
    return profile || null;
  }),

  // Get auto-fill preview from opportunity for proposal
  getOpportunityAutoFill: protectedProcedure
    .input(z.object({ opportunityId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const [opp] = await db
        .select()
        .from(opportunities)
        .where(and(eq(opportunities.id, input.opportunityId), eq(opportunities.workspaceId, workspaceId)))
        .limit(1);
      return opp || null;
    }),

  // Get auto-fill preview from proposal for contract
  getProposalAutoFill: protectedProcedure
    .input(z.object({ proposalId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const [prop] = await db
        .select()
        .from(proposals)
        .where(and(eq(proposals.id, input.proposalId), eq(proposals.workspaceId, workspaceId)))
        .limit(1);
      return prop || null;
    }),
});

// ==================== SOURCE REFERENCES ROUTER ====================
export const sourceReferencesRouter = router({
  getForRecord: protectedProcedure
    .input(z.object({ recordType: z.string(), recordId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      return db
        .select()
        .from(sourceReferences)
        .where(
          and(
            eq(sourceReferences.workspaceId, workspaceId),
            eq(sourceReferences.relatedRecordType, input.recordType),
            eq(sourceReferences.relatedRecordId, input.recordId)
          )
        )
        .orderBy(desc(sourceReferences.createdAt));
    }),

  create: protectedProcedure
    .input(
      z.object({
        relatedRecordType: z.string(),
        relatedRecordId: z.number(),
        sourceType: z.string(),
        sourceFileId: z.number().optional(),
        sourceUrl: z.string().optional(),
        sourceLocation: z.string().optional(),
        excerpt: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      await db.insert(sourceReferences).values({
        workspaceId,
        ...input,
      });
      return { success: true };
    }),
});

// ==================== TEMPLATE IMPROVEMENT SUGGESTIONS ROUTER ====================
export const templateImprovementsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    return db
      .select()
      .from(templateImprovementSuggestions)
      .where(eq(templateImprovementSuggestions.workspaceId, workspaceId))
      .orderBy(desc(templateImprovementSuggestions.createdAt));
  }),

  create: protectedProcedure
    .input(
      z.object({
        templateType: z.string(),
        sourceLessonId: z.number().optional(),
        title: z.string(),
        recommendation: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      await db.insert(templateImprovementSuggestions).values({
        workspaceId,
        ...input,
      });
      return { success: true };
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["new", "accepted", "rejected", "applied"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      await db
        .update(templateImprovementSuggestions)
        .set({ status: input.status })
        .where(
          and(
            eq(templateImprovementSuggestions.id, input.id),
            eq(templateImprovementSuggestions.workspaceId, workspaceId)
          )
        );
      return { success: true };
    }),
});

// ==================== HELP ARTICLES ROUTER ====================
export const helpArticlesRouter = router({
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(helpArticles).where(eq(helpArticles.isPublished, true)).orderBy(helpArticles.title);
  }),

  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [article] = await db
        .select()
        .from(helpArticles)
        .where(eq(helpArticles.slug, input.slug))
        .limit(1);
      return article || null;
    }),
});

// ==================== GLOSSARY ROUTER ====================
export const glossaryRouter = router({
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(glossaryTerms).orderBy(glossaryTerms.term);
  }),

  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [term] = await db
        .select()
        .from(glossaryTerms)
        .where(eq(glossaryTerms.slug, input.slug))
        .limit(1);
      return term || null;
    }),
});

// ==================== DASHBOARD DATA ROUTER ====================
export const dashboardDataRouter = router({
  // Get real workspace lifecycle snapshot
  getLifecycleSnapshot: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const workspaceId = await requireWorkspaceId(ctx.user.id);

    const [oppRows] = await db.select({ count: sql<number>`count(*)` }).from(opportunities).where(and(eq(opportunities.workspaceId, workspaceId), sql`${opportunities.deletedAt} IS NULL`));
    const [propRows] = await db.select({ count: sql<number>`count(*)` }).from(proposals).where(and(eq(proposals.workspaceId, workspaceId), sql`${proposals.deletedAt} IS NULL`));
    const [contractRows] = await db.select({ count: sql<number>`count(*)` }).from(contracts).where(and(eq(contracts.workspaceId, workspaceId), sql`${contracts.deletedAt} IS NULL`));
    const [invoiceRows] = await db.select({ count: sql<number>`count(*)` }).from(invoices).where(eq(invoices.workspaceId, workspaceId));
    const [paymentRows] = await db.select({ count: sql<number>`count(*)` }).from(payments).where(eq(payments.workspaceId, workspaceId));
    const [taskRows] = await db.select({ count: sql<number>`count(*)` }).from(tasks).where(and(eq(tasks.workspaceId, workspaceId), sql`${tasks.status} != 'completed'`));
    const [fileRows] = await db.select({ count: sql<number>`count(*)` }).from(files).where(and(eq(files.workspaceId, workspaceId), sql`${files.deletedAt} IS NULL`));
    const [suggestionRows] = await db.select({ count: sql<number>`count(*)` }).from(aiSuggestions).where(and(eq(aiSuggestions.workspaceId, workspaceId), eq(aiSuggestions.status, "new")));
    const [findingRows] = await db.select({ count: sql<number>`count(*)` }).from(aiFindings).where(and(eq(aiFindings.workspaceId, workspaceId), eq(aiFindings.reviewState, "unreviewed")));

    return {
      opportunities: oppRows?.count || 0,
      proposals: propRows?.count || 0,
      contracts: contractRows?.count || 0,
      invoices: invoiceRows?.count || 0,
      payments: paymentRows?.count || 0,
      openTasks: taskRows?.count || 0,
      files: fileRows?.count || 0,
      pendingSuggestions: suggestionRows?.count || 0,
      unreviewedFindings: findingRows?.count || 0,
    };
  }),

  // Get what needs attention
  getAttentionItems: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const items: Array<{ type: string; title: string; description: string; recordType?: string; recordId?: number; priority: string }> = [];

    // Check for contracts needing confirmation (setup status)
    const setupContracts = await db
      .select({ id: contracts.id, title: contracts.title })
      .from(contracts)
      .where(and(eq(contracts.workspaceId, workspaceId), eq(contracts.status, "setup"), sql`${contracts.deletedAt} IS NULL`))
      .limit(5);
    for (const c of setupContracts) {
      items.push({
        type: "contract_confirmation",
        title: `Contract "${c.title}" needs confirmation`,
        description: "Upload governing file and complete AI confirmation.",
        recordType: "contract",
        recordId: c.id,
        priority: "high",
      });
    }

    // Check for unreviewed AI findings
    const unreviewedFindings = await db
      .select({ id: aiFindings.id, title: aiFindings.title })
      .from(aiFindings)
      .where(and(eq(aiFindings.workspaceId, workspaceId), eq(aiFindings.reviewState, "unreviewed")))
      .limit(5);
    for (const f of unreviewedFindings) {
      items.push({
        type: "ai_finding_review",
        title: `AI Finding: "${f.title}" needs review`,
        description: "Review and approve or reject this AI finding.",
        recordType: "ai_finding",
        recordId: f.id,
        priority: "medium",
      });
    }

    // Check for overdue invoices
    const overdueInvoices = await db
      .select({ id: invoices.id, invoiceNumber: invoices.invoiceNumber })
      .from(invoices)
      .where(and(eq(invoices.workspaceId, workspaceId), eq(invoices.status, "overdue")))
      .limit(5);
    for (const inv of overdueInvoices) {
      items.push({
        type: "invoice_overdue",
        title: `Invoice ${inv.invoiceNumber} is overdue`,
        description: "Follow up on this overdue invoice.",
        recordType: "invoice",
        recordId: inv.id,
        priority: "high",
      });
    }

    return items;
  }),

  // Get setup readiness
  getSetupReadiness: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const workspaceId = await requireWorkspaceId(ctx.user.id);

    const [profile] = await db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.workspaceId, workspaceId))
      .limit(1);

    const checks = {
      hasBusinessProfile: !!profile,
      hasUEI: !!(profile?.uei),
      hasCAGE: !!(profile?.cage),
      hasSAM: !!profile?.samStatus,
      hasNAICS: !!profile?.naicsPrimary,
      profileComplete: false,
    };
    checks.profileComplete = checks.hasUEI && checks.hasCAGE && checks.hasSAM && checks.hasNAICS;
    return checks;
  }),
});

// ==================== AI SUGGESTIONS ENHANCED ROUTER ====================
export const aiSuggestionsEnhancedRouter = router({
  // List active suggestions for workspace
  listActive: protectedProcedure
    .input(z.object({ pageKey: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      return db
        .select()
        .from(aiSuggestions)
        .where(and(eq(aiSuggestions.workspaceId, workspaceId), eq(aiSuggestions.status, "new")))
        .orderBy(desc(aiSuggestions.createdAt))
        .limit(20);
    }),

  // Create task from suggestion
  createTaskFromSuggestion: protectedProcedure
    .input(z.object({ suggestionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const workspaceId = await requireWorkspaceId(ctx.user.id);

      // Get the suggestion
      const [suggestion] = await db
        .select()
        .from(aiSuggestions)
        .where(and(eq(aiSuggestions.id, input.suggestionId), eq(aiSuggestions.workspaceId, workspaceId)))
        .limit(1);
      if (!suggestion) throw new Error("Suggestion not found");

      // Create a task from it
      const result = await db.insert(tasks).values({
        workspaceId,
        title: suggestion.suggestionTitle,
        description: suggestion.suggestionText,
        status: "todo",
        priority: suggestion.priority || "medium",
        linkedRecordType: suggestion.relatedRecordType,
        linkedRecordId: suggestion.relatedRecordId,
      });

      // Update suggestion status
      await db
        .update(aiSuggestions)
        .set({ status: "completed", createdTaskId: getInsertId(result) })
        .where(eq(aiSuggestions.id, input.suggestionId));

      return { success: true, taskId: getInsertId(result) };
    }),

  // Accept suggestion
  accept: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      await db
        .update(aiSuggestions)
        .set({ status: "accepted", acceptedAt: new Date() })
        .where(and(eq(aiSuggestions.id, input.id), eq(aiSuggestions.workspaceId, workspaceId)));
      return { success: true };
    }),

  // Dismiss suggestion
  dismiss: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      await db
        .update(aiSuggestions)
        .set({ status: "dismissed", dismissedAt: new Date() })
        .where(and(eq(aiSuggestions.id, input.id), eq(aiSuggestions.workspaceId, workspaceId)));
      return { success: true };
    }),
});

// ==================== AI FINDINGS ENHANCED ROUTER ====================
export const aiFindingsEnhancedRouter = router({
  // List findings for a contract
  listForContract: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      return db
        .select()
        .from(aiFindings)
        .where(
          and(
            eq(aiFindings.workspaceId, workspaceId),
            eq(aiFindings.contractId, input.contractId),
            eq(aiFindings.staleStatus, "current")
          )
        )
        .orderBy(desc(aiFindings.createdAt));
    }),

  // Approve finding
  approve: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      await db
        .update(aiFindings)
        .set({ reviewState: "approved", reviewedBy: ctx.user.id, reviewedAt: new Date() })
        .where(and(eq(aiFindings.id, input.id), eq(aiFindings.workspaceId, workspaceId)));
      return { success: true };
    }),

  // Reject finding
  reject: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      await db
        .update(aiFindings)
        .set({ reviewState: "rejected", reviewedBy: ctx.user.id, reviewedAt: new Date() })
        .where(and(eq(aiFindings.id, input.id), eq(aiFindings.workspaceId, workspaceId)));
      return { success: true };
    }),

  // Mark stale
  markStale: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      await db
        .update(aiFindings)
        .set({ staleStatus: "stale", reviewState: "stale" })
        .where(and(eq(aiFindings.id, input.id), eq(aiFindings.workspaceId, workspaceId)));
      return { success: true };
    }),

  // Create live object from approved finding
  createLiveObject: protectedProcedure
    .input(
      z.object({
        findingId: z.number(),
        objectType: z.enum(["requirement", "deliverable", "deadline", "compliance_item"]),
        title: z.string(),
        description: z.string().optional(),
        contractId: z.number(),
        dueDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const workspaceId = await requireWorkspaceId(ctx.user.id);

      // Verify finding is approved
      const [finding] = await db
        .select()
        .from(aiFindings)
        .where(
          and(
            eq(aiFindings.id, input.findingId),
            eq(aiFindings.workspaceId, workspaceId),
            eq(aiFindings.reviewState, "approved")
          )
        )
        .limit(1);
      if (!finding) throw new Error("Finding must be approved before creating live objects");

      let objectId: number | undefined;

      if (input.objectType === "requirement") {
        const result = await db.insert(contractRequirements).values({
          workspaceId,
          contractId: input.contractId,
          title: input.title,
          description: input.description || "",
          aiFindingId: input.findingId,
        });
        objectId = getInsertId(result);
      } else if (input.objectType === "deliverable") {
        const result = await db.insert(deliverables).values({
          workspaceId,
          contractId: input.contractId,
          title: input.title,
          description: input.description || "",
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
        });
        objectId = getInsertId(result);
      } else if (input.objectType === "deadline") {
        const result = await db.insert(deadlines).values({
          workspaceId,
          title: input.title,
          description: input.description || "",
          dueDate: input.dueDate ? new Date(input.dueDate) : new Date(),
          linkedRecordType: "contract",
          linkedRecordId: input.contractId,
        });
        objectId = getInsertId(result);
      } else if (input.objectType === "compliance_item") {
        const result = await db.insert(complianceItems).values({
          workspaceId,
          contractId: input.contractId,
          title: input.title,
          description: input.description || "",
        });
        objectId = getInsertId(result);
      }

      // Update finding with live object reference
      if (objectId) {
        await db
          .update(aiFindings)
          .set({ approvedLiveObjectType: input.objectType, approvedLiveObjectId: objectId })
          .where(eq(aiFindings.id, input.findingId));
      }

      return { success: true, objectId };
    }),

  // Mark all findings stale for a contract (when governing file changes)
  markAllStaleForContract: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      await db
        .update(aiFindings)
        .set({ staleStatus: "stale" })
        .where(
          and(
            eq(aiFindings.workspaceId, workspaceId),
            eq(aiFindings.contractId, input.contractId),
            eq(aiFindings.staleStatus, "current")
          )
        );
      return { success: true };
    }),
});

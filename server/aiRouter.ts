/**
 * AI Router — tRPC procedures for the AI workflow system
 * 
 * Provides:
 * - AI run management (list, get, trigger scans)
 * - AI findings review (list, approve, reject, hold)
 * - AI suggestions management
 * - AI obligations approval flow
 * - AI usage tracking
 */

import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { aiRuns, aiFindings, aiSuggestions, aiExtractedObligations, aiUsageLogs, aiFindingHistory } from "../drizzle/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { runContractScan, runOpportunityReview, runProposalReview, runFileAnalysis, runInvoiceReview, runWorkspaceSummary } from "./aiEngine";

export const aiRouter = router({
  // ============================================================
  // AI Runs
  // ============================================================
  runs: router({
    list: protectedProcedure
      .input(z.object({ workspaceId: z.number(), limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        const runs = await (await getDb())!.select().from(aiRuns)
          .where(eq(aiRuns.workspaceId, input.workspaceId))
          .orderBy(desc(aiRuns.createdAt))
          .limit(input.limit)
          .offset(input.offset);
        const [total] = await (await getDb())!.select({ count: count() }).from(aiRuns).where(eq(aiRuns.workspaceId, input.workspaceId));
        return { runs, total: total?.count || 0 };
      }),

    get: protectedProcedure
      .input(z.object({ runId: z.number() }))
      .query(async ({ input }) => {
        const [run] = await (await getDb())!.select().from(aiRuns).where(eq(aiRuns.id, input.runId));
        if (!run) throw new Error("AI run not found");
        const findings = await (await getDb())!.select().from(aiFindings).where(eq(aiFindings.aiRunId, input.runId));
        const suggestions = await (await getDb())!.select().from(aiSuggestions).where(eq(aiSuggestions.aiRunId, input.runId));
        return { run, findings, suggestions };
      }),

    // Trigger AI scans
    contractScan: protectedProcedure
      .input(z.object({ workspaceId: z.number(), contractId: z.number(), documentContent: z.string(), contractTitle: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await runContractScan(
          { workspaceId: input.workspaceId, userId: ctx.user.id, recordType: "contract", recordId: input.contractId, runType: "contract_scan" },
          input.documentContent,
          input.contractTitle
        );
      }),

    opportunityReview: protectedProcedure
      .input(z.object({ workspaceId: z.number(), opportunityId: z.number(), opportunityData: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await runOpportunityReview(
          { workspaceId: input.workspaceId, userId: ctx.user.id, recordType: "opportunity", recordId: input.opportunityId, runType: "opportunity_review" },
          input.opportunityData
        );
      }),

    proposalReview: protectedProcedure
      .input(z.object({ workspaceId: z.number(), proposalId: z.number(), proposalData: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await runProposalReview(
          { workspaceId: input.workspaceId, userId: ctx.user.id, recordType: "proposal", recordId: input.proposalId, runType: "proposal_review" },
          input.proposalData
        );
      }),

    fileAnalysis: protectedProcedure
      .input(z.object({ workspaceId: z.number(), fileId: z.number(), fileContent: z.string(), fileName: z.string(), analysisType: z.string().default("analyze") }))
      .mutation(async ({ ctx, input }) => {
        return await runFileAnalysis(
          { workspaceId: input.workspaceId, userId: ctx.user.id, recordType: "file", recordId: input.fileId, runType: `file_${input.analysisType}` },
          input.fileContent,
          input.fileName,
          input.analysisType
        );
      }),

    invoiceReview: protectedProcedure
      .input(z.object({ workspaceId: z.number(), invoiceId: z.number(), invoiceData: z.string(), contractContext: z.string().default("") }))
      .mutation(async ({ ctx, input }) => {
        return await runInvoiceReview(
          { workspaceId: input.workspaceId, userId: ctx.user.id, recordType: "invoice", recordId: input.invoiceId, runType: "invoice_review" },
          input.invoiceData,
          input.contractContext
        );
      }),

    workspaceSummary: protectedProcedure
      .input(z.object({ workspaceId: z.number(), workspaceData: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await runWorkspaceSummary(
          { workspaceId: input.workspaceId, userId: ctx.user.id, recordType: "workspace", recordId: input.workspaceId, runType: "workspace_summary" },
          input.workspaceData
        );
      }),
  }),

  // ============================================================
  // AI Findings
  // ============================================================
  findings: router({
    list: protectedProcedure
      .input(z.object({
        workspaceId: z.number(),
        reviewState: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        const conditions = [eq(aiFindings.workspaceId, input.workspaceId)];
        if (input.reviewState) {
          conditions.push(eq(aiFindings.reviewState, input.reviewState as any));
        }
        const findings = await (await getDb())!.select().from(aiFindings)
          .where(and(...conditions))
          .orderBy(desc(aiFindings.createdAt))
          .limit(input.limit)
          .offset(input.offset);
        const [total] = await (await getDb())!.select({ count: count() }).from(aiFindings).where(and(...conditions));
        return { findings, total: total?.count || 0 };
      }),

    get: protectedProcedure
      .input(z.object({ findingId: z.number() }))
      .query(async ({ input }) => {
        const [finding] = await (await getDb())!.select().from(aiFindings).where(eq(aiFindings.id, input.findingId));
        if (!finding) throw new Error("Finding not found");
        const obligations = await (await getDb())!.select().from(aiExtractedObligations).where(eq(aiExtractedObligations.findingId, input.findingId));
        return { finding, obligations };
      }),

    updateReviewState: protectedProcedure
      .input(z.object({
        findingId: z.number(),
        newState: z.enum(["unreviewed", "acknowledged", "approved", "rejected", "stale"]),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const [finding] = await (await getDb())!.select().from(aiFindings).where(eq(aiFindings.id, input.findingId));
        if (!finding) throw new Error("Finding not found");

        const oldState = finding.reviewState;

        // Log history
        await (await getDb())!.insert(aiFindingHistory).values({
          findingId: input.findingId,
          oldState,
          newState: input.newState,
          changedBy: ctx.user.id,
          reason: input.reason,
        });

        // Update the finding
        const updateData: any = {
          reviewState: input.newState,
        };
        if (input.newState === "approved") {
          updateData.reviewedBy = ctx.user.id;
          updateData.reviewedAt = new Date();
        }

        await (await getDb())!.update(aiFindings).set(updateData).where(eq(aiFindings.id, input.findingId));
        return { success: true, oldState, newState: input.newState };
      }),

    bulkApprove: protectedProcedure
      .input(z.object({ findingIds: z.array(z.number()) }))
      .mutation(async ({ ctx, input }) => {
        for (const id of input.findingIds) {
          await (await getDb())!.insert(aiFindingHistory).values({
            findingId: id,
            oldState: "unreviewed",
            newState: "approved",
            changedBy: ctx.user.id,
            reason: "Bulk approved",
          });
          await (await getDb())!.update(aiFindings).set({
            reviewState: "approved",
            reviewedBy: ctx.user.id,
            reviewedAt: new Date(),
          }).where(eq(aiFindings.id, id));
        }
        return { success: true, count: input.findingIds.length };
      }),

    markStale: protectedProcedure
      .input(z.object({ runId: z.number() }))
      .mutation(async ({ input }) => {
        await (await getDb())!.update(aiFindings).set({ staleStatus: "stale" }).where(eq(aiFindings.aiRunId, input.runId));
        return { success: true };
      }),
  }),

  // ============================================================
  // AI Suggestions
  // ============================================================
  suggestions: router({
    list: protectedProcedure
      .input(z.object({
        workspaceId: z.number(),
        status: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        const conditions = [eq(aiSuggestions.workspaceId, input.workspaceId)];
        if (input.status) {
          conditions.push(eq(aiSuggestions.status, input.status as any));
        }
        const suggestions = await (await getDb())!.select().from(aiSuggestions)
          .where(and(...conditions))
          .orderBy(desc(aiSuggestions.createdAt))
          .limit(input.limit)
          .offset(input.offset);
        const [total] = await (await getDb())!.select({ count: count() }).from(aiSuggestions).where(and(...conditions));
        return { suggestions, total: total?.count || 0 };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        suggestionId: z.number(),
        status: z.enum(["new", "acknowledged", "accepted", "dismissed", "completed"]),
      }))
      .mutation(async ({ input }) => {
        const updateData: any = { status: input.status };
        if (input.status === "accepted") updateData.acceptedAt = new Date();
        if (input.status === "dismissed") updateData.dismissedAt = new Date();
        await (await getDb())!.update(aiSuggestions).set(updateData).where(eq(aiSuggestions.id, input.suggestionId));
        return { success: true };
      }),
  }),

  // ============================================================
  // AI Obligations (Approval Flow)
  // ============================================================
  obligations: router({
    list: protectedProcedure
      .input(z.object({
        workspaceId: z.number(),
        approvalState: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        const conditions = [eq(aiExtractedObligations.workspaceId, input.workspaceId)];
        if (input.approvalState) {
          conditions.push(eq(aiExtractedObligations.approvalState, input.approvalState as any));
        }
        const obligations = await (await getDb())!.select().from(aiExtractedObligations)
          .where(and(...conditions))
          .orderBy(desc(aiExtractedObligations.createdAt))
          .limit(input.limit)
          .offset(input.offset);
        const [total] = await (await getDb())!.select({ count: count() }).from(aiExtractedObligations).where(and(...conditions));
        return { obligations, total: total?.count || 0 };
      }),

    approve: protectedProcedure
      .input(z.object({ obligationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await (await getDb())!.update(aiExtractedObligations).set({
          approvalState: "approved",
          approvedBy: ctx.user.id,
          approvedAt: new Date(),
        }).where(eq(aiExtractedObligations.id, input.obligationId));
        // TODO: Create the actual live record (task, deadline, requirement, etc.) based on obligationType
        return { success: true };
      }),

    reject: protectedProcedure
      .input(z.object({ obligationId: z.number() }))
      .mutation(async ({ input }) => {
        await (await getDb())!.update(aiExtractedObligations).set({
          approvalState: "rejected",
        }).where(eq(aiExtractedObligations.id, input.obligationId));
        return { success: true };
      }),

    bulkApprove: protectedProcedure
      .input(z.object({ obligationIds: z.array(z.number()) }))
      .mutation(async ({ ctx, input }) => {
        for (const id of input.obligationIds) {
          await (await getDb())!.update(aiExtractedObligations).set({
            approvalState: "approved",
            approvedBy: ctx.user.id,
            approvedAt: new Date(),
          }).where(eq(aiExtractedObligations.id, id));
        }
        return { success: true, count: input.obligationIds.length };
      }),
  }),

  // ============================================================
  // AI Usage
  // ============================================================
  usage: router({
    summary: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(async ({ input }) => {
        const logs = await (await getDb())!.select().from(aiUsageLogs)
          .where(eq(aiUsageLogs.workspaceId, input.workspaceId))
          .orderBy(desc(aiUsageLogs.createdAt))
          .limit(100);
        
        const totalTokens = logs.reduce((sum, l) => sum + (l.inputTokens || 0) + (l.outputTokens || 0), 0);
        const totalCost = logs.reduce((sum, l) => sum + parseFloat(String(l.estimatedCost) || "0"), 0);
        const totalRuns = logs.length;

        return {
          logs,
          summary: { totalTokens, totalCost: totalCost.toFixed(4), totalRuns },
        };
      }),
  }),
});

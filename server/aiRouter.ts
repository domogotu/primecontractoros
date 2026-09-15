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
import { TRPCError } from "@trpc/server";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { getDb, getContract, getOpportunity, getProposal } from "./db";
import {
  aiRuns, aiFindings, aiSuggestions, aiExtractedObligations, aiUsageLogs, aiFindingHistory,
  type AiFinding, type AiExtractedObligation,
} from "../drizzle/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { runContractScan, runOpportunityReview, runProposalReview, runFileAnalysis, runInvoiceReview, runWorkspaceSummary } from "./aiEngine";
import {
  createTask,
  createDeliverable,
  createDeadline,
  createObligation,
  createComplianceItem,
  createContractRequirement,
  createAlert,
  getFileById,
  getInvoiceById,
} from "./entityDb";
import { logAudit } from "./featureRouter";
import { invokeLLM } from "./_core/llm";

async function requireActiveWorkspace(ctx: any, requestedWorkspaceId?: number): Promise<number> {
  if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
  const workspaceId = await requireWorkspaceId(ctx.user.id);
  if (requestedWorkspaceId !== undefined && requestedWorkspaceId !== workspaceId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Workspace access denied" });
  }
  return workspaceId;
}

async function requireAiRunInWorkspace(runId: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [run] = await db.select().from(aiRuns).where(and(eq(aiRuns.id, runId), eq(aiRuns.workspaceId, workspaceId))).limit(1);
  if (!run) throw new TRPCError({ code: "NOT_FOUND", message: "AI run not found" });
  return run;
}

async function requireFindingInWorkspace(findingId: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [finding] = await db.select().from(aiFindings).where(and(eq(aiFindings.id, findingId), eq(aiFindings.workspaceId, workspaceId))).limit(1);
  if (!finding) throw new TRPCError({ code: "NOT_FOUND", message: "Finding not found" });
  return finding;
}

async function requireSuggestionInWorkspace(suggestionId: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [suggestion] = await db.select().from(aiSuggestions).where(and(eq(aiSuggestions.id, suggestionId), eq(aiSuggestions.workspaceId, workspaceId))).limit(1);
  if (!suggestion) throw new TRPCError({ code: "NOT_FOUND", message: "Suggestion not found" });
  return suggestion;
}

async function requireObligationInWorkspace(obligationId: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [obligation] = await db.select().from(aiExtractedObligations).where(and(eq(aiExtractedObligations.id, obligationId), eq(aiExtractedObligations.workspaceId, workspaceId))).limit(1);
  if (!obligation) throw new TRPCError({ code: "NOT_FOUND", message: "Obligation not found" });
  return obligation;
}

// ============================================================
// Conversion helpers — Phase 1
// ============================================================

/**
 * Convert an approved AI finding into the correct live downstream record.
 * Returns { recordType, recordId } or null on failure.
 */
async function convertFindingToLiveRecord(
  finding: AiFinding,
  approvedBy: number
): Promise<{ recordType: string; recordId: number } | null> {
  const workspaceId = finding.workspaceId;
  const contractId = finding.contractId ?? undefined;
  const title = finding.title;
  const description = finding.summary || finding.practicalMeaning || undefined;

  if (contractId) {
    const contract = await getContract(contractId, workspaceId);
    if (!contract) {
      console.error("convertFindingToLiveRecord blocked cross-workspace or missing contract", { findingId: finding.id, contractId, workspaceId });
      return null;
    }
  }

  try {
    switch (finding.findingType) {
      case "requirement": {
        if (contractId) {
          const { id } = await createContractRequirement({ contractId, workspaceId, title, description, source: finding.sourceLocation ?? undefined });
          return { recordType: "contractRequirement", recordId: id };
        }
        const { id } = await createTask({ workspaceId, title: `[Requirement] ${title}`, description, priority: "high", linkedRecordType: "aiFinding", linkedRecordId: finding.id });
        return { recordType: "task", recordId: id };
      }
      case "deliverable": {
        if (contractId) {
          const { id } = await createDeliverable({ workspaceId, contractId, title, description, status: "not_started" });
          return { recordType: "deliverable", recordId: id };
        }
        const { id } = await createTask({ workspaceId, title: `[Deliverable] ${title}`, description, priority: "high", linkedRecordType: "aiFinding", linkedRecordId: finding.id });
        return { recordType: "task", recordId: id };
      }
      case "deadline": {
        const { id } = await createDeadline({ workspaceId, title, description, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), linkedRecordType: "aiFinding", linkedRecordId: finding.id, priority: "medium" });
        return { recordType: "deadline", recordId: id };
      }
      case "compliance":
      case "flowdown": {
        const { id } = await createComplianceItem({ workspaceId, contractId, title, description, category: finding.findingType === "flowdown" ? "flowdown" : "compliance" });
        return { recordType: "complianceItem", recordId: id };
      }
      case "billing_term": {
        if (contractId) {
          const { id } = await createObligation({ workspaceId, contractId, title, description, obligationType: "financial" });
          return { recordType: "obligation", recordId: id };
        }
        const { id } = await createTask({ workspaceId, title: `[Billing Term] ${title}`, description, priority: "medium", linkedRecordType: "aiFinding", linkedRecordId: finding.id });
        return { recordType: "task", recordId: id };
      }
      default: {
        const { id } = await createTask({ workspaceId, title: `[AI Finding] ${title}`, description, priority: "medium", linkedRecordType: "aiFinding", linkedRecordId: finding.id });
        return { recordType: "task", recordId: id };
      }
    }
  } catch (err) {
    console.error("convertFindingToLiveRecord error:", err);
    return null;
  }
}

/**
 * Convert an approved AI extracted obligation into the correct live downstream record.
 * Returns { recordType, recordId } or null on failure.
 */
async function convertObligationToLiveRecord(
  obligation: AiExtractedObligation,
  approvedBy: number
): Promise<{ recordType: string; recordId: number } | null> {
  const workspaceId = obligation.workspaceId;
  const title = obligation.title;
  const description = obligation.description ?? undefined;
  const dueDate = obligation.dueDate ? new Date(obligation.dueDate) : undefined;

  // Resolve contractId from the parent finding
  let contractId: number | undefined;
  try {
    const db = await getDb();
    if (db) {
      const [parentFinding] = await db.select().from(aiFindings).where(and(eq(aiFindings.id, obligation.findingId), eq(aiFindings.workspaceId, obligation.workspaceId)));
      contractId = parentFinding?.contractId ?? undefined;
    }
  } catch { /* contractId stays undefined */ }

  if (contractId) {
    const contract = await getContract(contractId, workspaceId);
    if (!contract) {
      console.error("convertObligationToLiveRecord blocked cross-workspace or missing contract", { obligationId: obligation.id, contractId, workspaceId });
      return null;
    }
  }

  try {
    switch (obligation.obligationType) {
      case "requirement": {
        if (contractId) {
          const { id } = await createContractRequirement({ contractId, workspaceId, title, description });
          return { recordType: "contractRequirement", recordId: id };
        }
        const { id } = await createTask({ workspaceId, title: `[Requirement] ${title}`, description, dueDate, priority: "high", linkedRecordType: "aiObligation", linkedRecordId: obligation.id });
        return { recordType: "task", recordId: id };
      }
      case "deliverable": {
        if (contractId) {
          const { id } = await createDeliverable({ workspaceId, contractId, title, description, dueDate, status: "not_started" });
          return { recordType: "deliverable", recordId: id };
        }
        const { id } = await createTask({ workspaceId, title: `[Deliverable] ${title}`, description, dueDate, priority: "high", linkedRecordType: "aiObligation", linkedRecordId: obligation.id });
        return { recordType: "task", recordId: id };
      }
      case "deadline": {
        const { id } = await createDeadline({ workspaceId, title, description, dueDate: dueDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), linkedRecordType: "aiObligation", linkedRecordId: obligation.id, priority: "medium" });
        return { recordType: "deadline", recordId: id };
      }
      case "compliance_item": {
        const { id } = await createComplianceItem({ workspaceId, contractId, title, description, dueDate });
        return { recordType: "complianceItem", recordId: id };
      }
      case "alert": {
        const { id } = await createAlert({ workspaceId, title, message: description, type: "warning", linkedRecordType: "aiObligation", linkedRecordId: obligation.id });
        return { recordType: "alert", recordId: id };
      }
      default: {
        const { id } = await createTask({ workspaceId, title, description, dueDate, priority: "medium", linkedRecordType: "aiObligation", linkedRecordId: obligation.id });
        return { recordType: "task", recordId: id };
      }
    }
  } catch (err) {
    console.error("convertObligationToLiveRecord error:", err);
    return null;
  }
}

export const aiRouter = router({
  // ============================================================
  // AI Runs
  // ============================================================
  runs: router({
    list: protectedProcedure
      .input(z.object({ workspaceId: z.number(), limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
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
      .query(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const workspaceId = await requireActiveWorkspace(ctx);
        const run = await requireAiRunInWorkspace(input.runId, workspaceId);
        const findings = await (await getDb())!.select().from(aiFindings).where(and(eq(aiFindings.aiRunId, input.runId), eq(aiFindings.workspaceId, workspaceId)));
        const suggestions = await (await getDb())!.select().from(aiSuggestions).where(and(eq(aiSuggestions.aiRunId, input.runId), eq(aiSuggestions.workspaceId, workspaceId)));
        return { run, findings, suggestions };
      }),

    // Trigger AI scans
    contractScan: protectedProcedure
      .input(z.object({ workspaceId: z.number(), contractId: z.number(), documentContent: z.string(), contractTitle: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, input.workspaceId);
        const contract = await getContract(input.contractId, input.workspaceId);
        if (!contract) throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found in this workspace" });
        return await runContractScan(
          { workspaceId: input.workspaceId, userId: ctx.user.id, recordType: "contract", recordId: input.contractId, runType: "contract_scan" },
          input.documentContent,
          input.contractTitle
        );
      }),

    opportunityReview: protectedProcedure
      .input(z.object({ workspaceId: z.number(), opportunityId: z.number(), opportunityData: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, input.workspaceId);
        const opportunity = await getOpportunity(input.opportunityId, input.workspaceId);
        if (!opportunity) throw new TRPCError({ code: "NOT_FOUND", message: "Opportunity not found in this workspace" });
        return await runOpportunityReview(
          { workspaceId: input.workspaceId, userId: ctx.user.id, recordType: "opportunity", recordId: input.opportunityId, runType: "opportunity_review" },
          input.opportunityData
        );
      }),

    proposalReview: protectedProcedure
      .input(z.object({ workspaceId: z.number(), proposalId: z.number(), proposalData: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, input.workspaceId);
        const proposal = await getProposal(input.proposalId, input.workspaceId);
        if (!proposal) throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found in this workspace" });
        return await runProposalReview(
          { workspaceId: input.workspaceId, userId: ctx.user.id, recordType: "proposal", recordId: input.proposalId, runType: "proposal_review" },
          input.proposalData
        );
      }),

    fileAnalysis: protectedProcedure
      .input(z.object({ workspaceId: z.number(), fileId: z.number(), fileContent: z.string(), fileName: z.string(), analysisType: z.string().default("analyze") }))
      .mutation(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, input.workspaceId);
        const file = await getFileById(input.fileId, input.workspaceId);
        if (!file) throw new TRPCError({ code: "NOT_FOUND", message: "File not found in this workspace" });
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
        await requireActiveWorkspace(ctx, input.workspaceId);
        const invoice = await getInvoiceById(input.invoiceId, input.workspaceId);
        if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found in this workspace" });
        return await runInvoiceReview(
          { workspaceId: input.workspaceId, userId: ctx.user.id, recordType: "invoice", recordId: input.invoiceId, runType: "invoice_review" },
          input.invoiceData,
          input.contractContext
        );
      }),

    workspaceSummary: protectedProcedure
      .input(z.object({ workspaceId: z.number(), workspaceData: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
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
      .query(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
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
      .query(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const workspaceId = await requireActiveWorkspace(ctx);
        const finding = await requireFindingInWorkspace(input.findingId, workspaceId);
        const obligations = await (await getDb())!.select().from(aiExtractedObligations).where(and(eq(aiExtractedObligations.findingId, input.findingId), eq(aiExtractedObligations.workspaceId, workspaceId)));
        return { finding, obligations };
      }),

    updateReviewState: protectedProcedure
      .input(z.object({
        findingId: z.number(),
        newState: z.enum(["unreviewed", "acknowledged", "approved", "rejected", "stale"]),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const db = await getDb();
        const workspaceId = await requireActiveWorkspace(ctx);
        const finding = await requireFindingInWorkspace(input.findingId, workspaceId);

        const oldState = finding.reviewState;

        // Log history
        await db!.insert(aiFindingHistory).values({
          findingId: input.findingId,
          oldState,
          newState: input.newState,
          changedBy: ctx.user.id,
          reason: input.reason,
        });

        const updateData: any = { reviewState: input.newState };
        let createdRecordType: string | null = null;
        let createdRecordId: number | null = null;

        if (input.newState === "approved") {
          updateData.reviewedBy = ctx.user.id;
          updateData.reviewedAt = new Date();

          // Create the live downstream record only once. Re-approval is idempotent.
          if (finding.approvedLiveObjectId && finding.approvedLiveObjectType) {
            createdRecordType = finding.approvedLiveObjectType;
            createdRecordId = finding.approvedLiveObjectId;
          } else {
            const result = await convertFindingToLiveRecord(finding, ctx.user.id);
            if (result) {
              createdRecordType = result.recordType;
              createdRecordId = result.recordId;
              updateData.approvedLiveObjectType = result.recordType;
              updateData.approvedLiveObjectId = result.recordId;
            }
          }

          try {
            await logAudit(finding.workspaceId, ctx.user.id, "update", "aiFinding", input.findingId, {
              action: "approved", reason: input.reason, createdRecordType, createdRecordId,
            });
          } catch {}
        }

        await db!.update(aiFindings).set(updateData).where(and(eq(aiFindings.id, input.findingId), eq(aiFindings.workspaceId, workspaceId)));
        return { success: true, oldState, newState: input.newState, createdRecordType, createdRecordId };
      }),

    bulkApprove: protectedProcedure
      .input(z.object({ findingIds: z.array(z.number()) }))
      .mutation(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const db = await getDb();
        const workspaceId = await requireActiveWorkspace(ctx);
        const results: Array<{ findingId: number; recordType: string | null; recordId: number | null }> = [];

        for (const id of input.findingIds) {
          let finding;
          try { finding = await requireFindingInWorkspace(id, workspaceId); } catch { continue; }

          await db!.insert(aiFindingHistory).values({
            findingId: id,
            oldState: finding.reviewState ?? "unreviewed",
            newState: "approved",
            changedBy: ctx.user.id,
            reason: "Bulk approved",
          });

          const updateData: any = { reviewState: "approved", reviewedBy: ctx.user.id, reviewedAt: new Date() };
          let createdRecordType: string | null = null;
          let createdRecordId: number | null = null;

          // Create the live downstream record only once. Bulk re-approval is idempotent.
          if (finding.approvedLiveObjectId && finding.approvedLiveObjectType) {
            createdRecordType = finding.approvedLiveObjectType;
            createdRecordId = finding.approvedLiveObjectId;
          } else {
            const result = await convertFindingToLiveRecord(finding, ctx.user.id);
            if (result) {
              createdRecordType = result.recordType;
              createdRecordId = result.recordId;
              updateData.approvedLiveObjectType = result.recordType;
              updateData.approvedLiveObjectId = result.recordId;
            }
          }

          await db!.update(aiFindings).set(updateData).where(and(eq(aiFindings.id, id), eq(aiFindings.workspaceId, workspaceId)));

          try {
            await logAudit(finding.workspaceId, ctx.user.id, "update", "aiFinding", id, {
              action: "bulk_approved", createdRecordType, createdRecordId,
            });
          } catch {}

          results.push({ findingId: id, recordType: createdRecordType, recordId: createdRecordId });
        }

        return { success: true, count: input.findingIds.length, results };
      }),

    markStale: protectedProcedure
      .input(z.object({ runId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const workspaceId = await requireActiveWorkspace(ctx);
        await requireAiRunInWorkspace(input.runId, workspaceId);
        await (await getDb())!.update(aiFindings).set({ staleStatus: "stale" }).where(and(eq(aiFindings.aiRunId, input.runId), eq(aiFindings.workspaceId, workspaceId)));
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
      .query(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
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
      .mutation(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const workspaceId = await requireActiveWorkspace(ctx);
        await requireSuggestionInWorkspace(input.suggestionId, workspaceId);
        const updateData: any = { status: input.status };
        if (input.status === "accepted") updateData.acceptedAt = new Date();
        if (input.status === "dismissed") updateData.dismissedAt = new Date();
        await (await getDb())!.update(aiSuggestions).set(updateData).where(and(eq(aiSuggestions.id, input.suggestionId), eq(aiSuggestions.workspaceId, workspaceId)));
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
      .query(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
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
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const db = await getDb();
        const workspaceId = await requireActiveWorkspace(ctx);
        const obligation = await requireObligationInWorkspace(input.obligationId, workspaceId);

        // Create the live downstream record only once. Re-approval is idempotent.
        const result = obligation.createdRecordId && obligation.createdRecordType
          ? { recordType: obligation.createdRecordType, recordId: obligation.createdRecordId }
          : await convertObligationToLiveRecord(obligation, ctx.user.id);

        const updateData: any = {
          approvalState: "approved",
          approvedBy: ctx.user.id,
          approvedAt: new Date(),
        };
        if (result && !obligation.createdRecordId) {
          updateData.createdRecordType = result.recordType;
          updateData.createdRecordId = result.recordId;
        }

        await db!.update(aiExtractedObligations).set(updateData).where(and(eq(aiExtractedObligations.id, input.obligationId), eq(aiExtractedObligations.workspaceId, workspaceId)));

        try {
          await logAudit(obligation.workspaceId, ctx.user.id, "update", "aiObligation", input.obligationId, {
            action: "approved", createdRecordType: result?.recordType ?? null, createdRecordId: result?.recordId ?? null,
          });
        } catch {}

        return { success: true, createdRecordType: result?.recordType ?? null, createdRecordId: result?.recordId ?? null };
      }),

    reject: protectedProcedure
      .input(z.object({ obligationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const workspaceId = await requireActiveWorkspace(ctx);
        await requireObligationInWorkspace(input.obligationId, workspaceId);
        await (await getDb())!.update(aiExtractedObligations).set({
          approvalState: "rejected",
        }).where(and(eq(aiExtractedObligations.id, input.obligationId), eq(aiExtractedObligations.workspaceId, workspaceId)));
        return { success: true };
      }),

    bulkApprove: protectedProcedure
      .input(z.object({ obligationIds: z.array(z.number()) }))
      .mutation(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
        const db = await getDb();
        const workspaceId = await requireActiveWorkspace(ctx);
        const results: Array<{ obligationId: number; recordType: string | null; recordId: number | null }> = [];

        for (const id of input.obligationIds) {
          let obligation;
          try { obligation = await requireObligationInWorkspace(id, workspaceId); } catch { continue; }

          // Create the live downstream record only once. Bulk re-approval is idempotent.
          const result = obligation.createdRecordId && obligation.createdRecordType
            ? { recordType: obligation.createdRecordType, recordId: obligation.createdRecordId }
            : await convertObligationToLiveRecord(obligation, ctx.user.id);

          const updateData: any = { approvalState: "approved", approvedBy: ctx.user.id, approvedAt: new Date() };
          if (result && !obligation.createdRecordId) {
            updateData.createdRecordType = result.recordType;
            updateData.createdRecordId = result.recordId;
          }

          await db!.update(aiExtractedObligations).set(updateData).where(and(eq(aiExtractedObligations.id, id), eq(aiExtractedObligations.workspaceId, workspaceId)));

          try {
            await logAudit(obligation.workspaceId, ctx.user.id, "update", "aiObligation", id, {
              action: "bulk_approved", createdRecordType: result?.recordType ?? null, createdRecordId: result?.recordId ?? null,
            });
          } catch {}

          results.push({ obligationId: id, recordType: result?.recordType ?? null, recordId: result?.recordId ?? null });
        }

        return { success: true, count: input.obligationIds.length, results };
      }),
  }),

  // ============================================================
  // AI Usage
  // ============================================================
  usage: router({
    summary: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
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

  getFieldGuidance: protectedProcedure
    .input(z.object({
      fieldName: z.string(),
      fieldDescription: z.string(),
      currentValue: z.string().optional(),
      companyName: z.string().optional(),
      companyContext: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireActiveWorkspace(ctx, (input as any)?.workspaceId);
      const prompt = `You are a government contracting expert helping a small business fill out their business profile for federal contracting.

Field: ${input.fieldName}
Description: ${input.fieldDescription}
${input.companyName ? `Company: ${input.companyName}` : ''}
${input.companyContext ? `Context: ${input.companyContext}` : ''}
${input.currentValue ? `Current value: ${input.currentValue}` : ''}

Provide a helpful, concise explanation of:
1. What this field is and why it matters for government contracting
2. What format/content is expected
3. A specific example or suggestion they could use

Keep it under 150 words. Be practical and actionable.`;

      const result = await invokeLLM({ 
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300 
      });
      const content = result.choices[0]?.message?.content;
      return { guidance: typeof content === 'string' ? content : JSON.stringify(content) };
    }),
});

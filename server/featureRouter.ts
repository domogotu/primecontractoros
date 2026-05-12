import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { requireWorkspaceId } from "./workspaceMiddleware";
import {
  contractClins, contractModifications, keyPersonnel, complianceMatrix,
  auditLog, workspaceSettings, workspaceMembers, invoices, payments, contracts,
  aiFindings, aiRuns, tasks, proposalTeamAssignments, proposals, opportunities
} from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

// ===== Contract CLINs =====
export const clinsRouter = router({
  list: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .query(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      return db!.select().from(contractClins)
        .where(and(eq(contractClins.contractId, input.contractId), eq(contractClins.workspaceId, wsId)));
    }),
  create: protectedProcedure
    .input(z.object({
      contractId: z.number(),
      clinNumber: z.string(),
      description: z.string().optional(),
      quantity: z.number().optional(),
      unitPrice: z.string().optional(),
      totalValue: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      await db!.insert(contractClins).values({ ...input, workspaceId: wsId });
      await logAudit(wsId, ctx.user.id, "create", "contractClin", 0, input);
      return { success: true };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      await db!.delete(contractClins).where(and(eq(contractClins.id, input.id), eq(contractClins.workspaceId, wsId)));
      await logAudit(wsId, ctx.user.id, "delete", "contractClin", input.id, null);
      return { success: true };
    }),
});

// ===== Contract Modifications =====
export const modificationsRouter = router({
  list: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .query(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      return db!.select().from(contractModifications)
        .where(and(eq(contractModifications.contractId, input.contractId), eq(contractModifications.workspaceId, wsId)))
        .orderBy(desc(contractModifications.createdAt));
    }),
  create: protectedProcedure
    .input(z.object({
      contractId: z.number(),
      modNumber: z.string(),
      title: z.string(),
      description: z.string().optional(),
      modType: z.enum(["administrative", "funding", "scope", "period_of_performance", "other"]).optional(),
      valueChange: z.string().optional(),
      effectiveDate: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      await db!.insert(contractModifications).values({ ...input, workspaceId: wsId });
      await logAudit(wsId, ctx.user.id, "create", "contractModification", 0, input);
      return { success: true };
    }),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "submitted", "approved", "rejected"]).optional(),
      title: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      const { id, ...data } = input;
      await db!.update(contractModifications).set(data)
        .where(and(eq(contractModifications.id, id), eq(contractModifications.workspaceId, wsId)));
      await logAudit(wsId, ctx.user.id, "update", "contractModification", id, data);
      return { success: true };
    }),
});

// ===== Key Personnel =====
export const personnelRouter = router({
  list: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .query(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      return db!.select().from(keyPersonnel)
        .where(and(eq(keyPersonnel.contractId, input.contractId), eq(keyPersonnel.workspaceId, wsId)));
    }),
  create: protectedProcedure
    .input(z.object({
      contractId: z.number(),
      name: z.string(),
      role: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
      clearanceLevel: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      await db!.insert(keyPersonnel).values({ ...input, workspaceId: wsId });
      await logAudit(wsId, ctx.user.id, "create", "keyPersonnel", 0, input);
      return { success: true };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      await db!.delete(keyPersonnel).where(and(eq(keyPersonnel.id, input.id), eq(keyPersonnel.workspaceId, wsId)));
      await logAudit(wsId, ctx.user.id, "delete", "keyPersonnel", input.id, null);
      return { success: true };
    }),
});

// ===== Compliance Matrix =====
export const complianceMatrixRouter = router({
  list: protectedProcedure
    .input(z.object({ proposalId: z.number() }))
    .query(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      return db!.select().from(complianceMatrix)
        .where(and(eq(complianceMatrix.proposalId, input.proposalId), eq(complianceMatrix.workspaceId, wsId)));
    }),
  create: protectedProcedure
    .input(z.object({
      proposalId: z.number(),
      requirement: z.string(),
      section: z.string().optional(),
      responseLocation: z.string().optional(),
      assignedTo: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      await db!.insert(complianceMatrix).values({ ...input, workspaceId: wsId });
      await logAudit(wsId, ctx.user.id, "create", "complianceMatrix", 0, input);
      return { success: true };
    }),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["not_started", "in_progress", "complete", "non_compliant"]).optional(),
      assignedTo: z.string().optional(),
      notes: z.string().optional(),
      responseLocation: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      const { id, ...data } = input;
      await db!.update(complianceMatrix).set(data)
        .where(and(eq(complianceMatrix.id, id), eq(complianceMatrix.workspaceId, wsId)));
      await logAudit(wsId, ctx.user.id, "update", "complianceMatrix", id, data);
      return { success: true };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      await db!.delete(complianceMatrix).where(and(eq(complianceMatrix.id, input.id), eq(complianceMatrix.workspaceId, wsId)));
      await logAudit(wsId, ctx.user.id, "delete", "complianceMatrix", input.id, null);
      return { success: true };
    }),
});

// ===== Proposal Team Assignments =====
export const teamAssignmentsRouter = router({
  list: protectedProcedure
    .input(z.object({ proposalId: z.number() }))
    .query(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      return db!.select().from(proposalTeamAssignments)
        .where(and(eq(proposalTeamAssignments.proposalId, input.proposalId), eq(proposalTeamAssignments.workspaceId, wsId)));
    }),
  create: protectedProcedure
    .input(z.object({
      proposalId: z.number(),
      memberName: z.string(),
      role: z.string(),
      sectionResponsibility: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      await db!.insert(proposalTeamAssignments).values({ ...input, workspaceId: wsId });
      await logAudit(wsId, ctx.user.id, "create", "teamAssignment", 0, input);
      return { success: true };
    }),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["assigned", "in_progress", "review", "complete"]).optional(),
      sectionResponsibility: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      const { id, ...data } = input;
      await db!.update(proposalTeamAssignments).set(data)
        .where(and(eq(proposalTeamAssignments.id, id), eq(proposalTeamAssignments.workspaceId, wsId)));
      await logAudit(wsId, ctx.user.id, "update", "teamAssignment", id, data);
      return { success: true };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      await db!.delete(proposalTeamAssignments).where(and(eq(proposalTeamAssignments.id, input.id), eq(proposalTeamAssignments.workspaceId, wsId)));
      await logAudit(wsId, ctx.user.id, "delete", "teamAssignment", input.id, null);
      return { success: true };
    }),
});

// ===== Workspace Settings =====
export const settingsRouter = router({
  get: protectedProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      const [setting] = await db!.select().from(workspaceSettings)
        .where(and(eq(workspaceSettings.workspaceId, wsId), eq(workspaceSettings.settingKey, input.key)));
      return setting?.settingValue ?? null;
    }),
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      const settings = await db!.select().from(workspaceSettings).where(eq(workspaceSettings.workspaceId, wsId));
      const map: Record<string, string | null> = {};
      for (const s of settings) {
        map[s.settingKey] = s.settingValue;
      }
      return map;
    }),
  set: protectedProcedure
    .input(z.object({ key: z.string(), value: z.string().nullable() }))
    .mutation(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      const [existing] = await db!.select().from(workspaceSettings)
        .where(and(eq(workspaceSettings.workspaceId, wsId), eq(workspaceSettings.settingKey, input.key)));
      if (existing) {
        await db!.update(workspaceSettings).set({ settingValue: input.value })
          .where(eq(workspaceSettings.id, existing.id));
      } else {
        await db!.insert(workspaceSettings).values({ workspaceId: wsId, settingKey: input.key, settingValue: input.value });
      }
      return { success: true };
    }),
});

// ===== Finance Summary =====
export const financeRouter = router({
  summary: protectedProcedure
    .query(async ({ ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      // Get all invoices
      const allInvoices = await db!.select().from(invoices).where(eq(invoices.workspaceId, wsId));
      const allPayments = await db!.select().from(payments).where(eq(payments.workspaceId, wsId));
      const allContracts = await db!.select().from(contracts).where(eq(contracts.workspaceId, wsId));

      const totalInvoiced = allInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount?.toString() || "0"), 0);
      const totalPaid = allPayments.reduce((sum, pay) => sum + parseFloat(pay.amount?.toString() || "0"), 0);
      const outstanding = totalInvoiced - totalPaid;

      // Per-contract breakdown
      const byContract = allContracts.map(c => {
        const contractInvoices = allInvoices.filter(inv => inv.contractId === c.id);
        const contractPayments = allPayments.filter(pay => pay.contractId === c.id);
        const invoiced = contractInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount?.toString() || "0"), 0);
        const paid = contractPayments.reduce((sum, pay) => sum + parseFloat(pay.amount?.toString() || "0"), 0);
        return {
          contractId: c.id,
          contractTitle: c.title,
          contractNumber: c.contractNumber,
          contractValue: parseFloat(c.value?.toString() || "0"),
          invoiced,
          paid,
          outstanding: invoiced - paid,
        };
      });

      return {
        totalInvoiced,
        totalPaid,
        outstanding,
        contractCount: allContracts.length,
        byContract,
      };
    }),
});

// ===== AI Findings Workflow =====
export const findingsRouter = router({
  list: protectedProcedure
    .input(z.object({ reviewState: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      const conditions = [eq(aiFindings.workspaceId, wsId)];
      if (input?.reviewState) {
        conditions.push(eq(aiFindings.reviewState, input.reviewState as any));
      }
      return db!.select().from(aiFindings).where(and(...conditions)).orderBy(desc(aiFindings.createdAt));
    }),
  runs: protectedProcedure.query(async ({ ctx }) => {
    const wsId = await requireWorkspaceId(ctx.user.id);
    const db = await getDb();
    const runs = await db!.select().from(aiRuns).where(eq(aiRuns.workspaceId, wsId)).orderBy(desc(aiRuns.createdAt));
    // Get finding counts per run
    const allFindings = await db!.select().from(aiFindings).where(eq(aiFindings.workspaceId, wsId));
    return runs.map((run) => ({
      ...run,
      findingCount: allFindings.filter((f) => f.aiRunId === run.id).length,
    }));
  }),
  review: protectedProcedure
    .input(z.object({
      findingId: z.number(),
      action: z.enum(["confirm", "reject", "defer", "hold", "needs_review"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      
      let newState: string;
      let resultingTaskId: number | null = null;

      if (input.action === "confirm") {
        newState = "approved";
        // Create a task from the finding
        const [finding] = await db!.select().from(aiFindings).where(eq(aiFindings.id, input.findingId));
        if (finding) {
          const [task] = await db!.insert(tasks).values({
            workspaceId: wsId,
            title: `[AI Finding] ${finding.title}`,
            description: finding.summary,
            priority: "high",
            status: "todo",
          }).$returningId();
          resultingTaskId = task?.id ?? null;
        }
      } else if (input.action === "reject") {
        newState = "rejected";
      } else if (input.action === "hold") {
        newState = "acknowledged"; // hold = acknowledged but not acted on
      } else if (input.action === "needs_review") {
        newState = "unreviewed"; // reset to unreviewed for another pass
      } else {
        newState = "unreviewed"; // defer keeps it in queue
      }

      await db!.update(aiFindings).set({
        reviewState: newState as any,
        reviewedBy: ctx.user.id,
        reviewedAt: new Date(),
      }).where(and(eq(aiFindings.id, input.findingId), eq(aiFindings.workspaceId, wsId)));

      await logAudit(wsId, ctx.user.id, "update", "aiFinding", input.findingId, { action: input.action, notes: input.notes });
      return { success: true, resultingTaskId };
    }),
});

// ===== AI Findings Generation =====
export const generateFindingsRouter = router({
  generate: protectedProcedure
    .input(z.object({
      scope: z.enum(["workspace", "contract", "proposal", "opportunity"]).default("workspace"),
      recordId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Gather context based on scope
      let contextSummary = "";
      let relatedRecordType = input.scope;
      let relatedRecordId = input.recordId;

      if (input.scope === "contract" && input.recordId) {
        const [contract] = await db.select().from(contracts)
          .where(and(eq(contracts.id, input.recordId), eq(contracts.workspaceId, wsId)));
        if (contract) {
          contextSummary = `Contract: ${contract.title}\nAgency: ${contract.agency || "N/A"}\nContract #: ${contract.contractNumber || "N/A"}\nValue: $${contract.value || "N/A"}\nStatus: ${contract.status}\nHealth: ${contract.health}\nStart: ${contract.startDate ? new Date(contract.startDate).toLocaleDateString() : "N/A"}\nEnd: ${contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "N/A"}`;
        }
      } else if (input.scope === "proposal" && input.recordId) {
        const [proposal] = await db.select().from(proposals)
          .where(and(eq(proposals.id, input.recordId), eq(proposals.workspaceId, wsId)));
        if (proposal) {
          contextSummary = `Proposal: ${proposal.title}\nFramework: ${proposal.framework || "N/A"}\nStatus: ${proposal.status}\nDue: ${proposal.dueDate ? new Date(proposal.dueDate).toLocaleDateString() : "N/A"}`;
        }
      } else if (input.scope === "opportunity" && input.recordId) {
        const [opp] = await db.select().from(opportunities)
          .where(and(eq(opportunities.id, input.recordId), eq(opportunities.workspaceId, wsId)));
        if (opp) {
          contextSummary = `Opportunity: ${opp.title}\nAgency: ${opp.agency || "N/A"}\nNAICS: ${opp.naics || "N/A"}\nStatus: ${opp.status}\nDue: ${opp.dueDate ? new Date(opp.dueDate).toLocaleDateString() : "N/A"}\nSummary: ${opp.summary || "N/A"}`;
        }
      } else {
        // Workspace-wide analysis
        const allContracts = await db.select().from(contracts).where(eq(contracts.workspaceId, wsId));
        const allProposals = await db.select().from(proposals).where(eq(proposals.workspaceId, wsId));
        const allOpps = await db.select().from(opportunities).where(eq(opportunities.workspaceId, wsId));
        contextSummary = `Workspace Analysis:\n- ${allContracts.length} contracts (${allContracts.filter(c => c.status === "active").length} active, ${allContracts.filter(c => c.health === "at_risk").length} at risk)\n- ${allProposals.length} proposals (${allProposals.filter(p => p.status === "in_progress").length} in progress)\n- ${allOpps.length} opportunities (${allOpps.filter(o => o.status === "pursue").length} pursuing)`;
        relatedRecordType = "workspace";
      }

      // Create AI run record
      const runResult = await db.insert(aiRuns).values({
        workspaceId: wsId,
        userId: ctx.user.id,
        relatedRecordType,
        relatedRecordId: relatedRecordId ?? null,
        aiType: "findings",
        purpose: `AI findings analysis for ${input.scope}`,
        inputSummary: contextSummary.substring(0, 500),
        status: "processing",
        modelUsed: "gpt-4.1-mini",
      });
      const runId = (runResult as any).insertId as number;

      try {
        // Call LLM to generate findings
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a government contracting compliance expert. Analyze the provided context and generate specific, actionable findings. Each finding should identify a concrete issue, risk, or improvement opportunity relevant to FAR/DFARS compliance, contract performance, or business development. Return a JSON array of findings.`,
            },
            {
              role: "user",
              content: `Analyze this government contracting context and return 3-5 findings as a JSON array. Each finding must have: title (string), summary (string, 1-2 sentences), findingType (one of: compliance, risk, missing_item, inconsistency, recommendation), practicalMeaning (string, what this means for the contractor), confidence (integer 60-95).\n\nContext:\n${contextSummary}\n\nReturn ONLY a valid JSON array, no markdown.`,
            },
          ],
          responseFormat: { type: "json_object" } as any,
        });

        const content = response.choices[0]?.message?.content;
        if (!content || typeof content !== "string") throw new Error("No response from LLM");

        let findingsData: any[] = [];
        try {
          const parsed = JSON.parse(content);
          findingsData = Array.isArray(parsed) ? parsed : (parsed.findings || parsed.results || []);
        } catch {
          // If JSON parse fails, create a single finding from the text
          findingsData = [{
            title: "AI Analysis Complete",
            summary: content.substring(0, 300),
            findingType: "recommendation",
            practicalMeaning: "Review the analysis and take appropriate action.",
            confidence: 70,
          }];
        }

        // Store each finding
        for (const finding of findingsData) {
          if (!finding.title || !finding.summary) continue;
          await db.insert(aiFindings).values({
            workspaceId: wsId,
            aiRunId: runId,
            contractId: input.scope === "contract" ? input.recordId ?? null : null,
            findingType: finding.findingType || "recommendation",
            title: String(finding.title).substring(0, 255),
            summary: String(finding.summary),
            practicalMeaning: finding.practicalMeaning ? String(finding.practicalMeaning) : null,
            confidence: typeof finding.confidence === "number" ? Math.min(100, Math.max(0, finding.confidence)) : 75,
            reviewState: "unreviewed",
            staleStatus: "current",
          });
        }

        // Mark run as completed
        await db.update(aiRuns).set({ status: "completed" }).where(eq(aiRuns.id, runId));

        return { success: true, runId, findingCount: findingsData.length };
      } catch (error) {
        // Mark run as failed
        await db.update(aiRuns).set({ status: "failed" }).where(eq(aiRuns.id, runId));
        console.error("AI findings generation failed:", error);
        throw error;
      }
    }),
});

// ===== Audit Log =====
export const auditRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().optional(), entity: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      const conditions = [eq(auditLog.workspaceId, wsId)];
      if (input?.entity) {
        conditions.push(eq(auditLog.entity, input.entity));
      }
      return db!.select().from(auditLog)
        .where(and(...conditions))
        .orderBy(desc(auditLog.timestamp))
        .limit(input?.limit ?? 50);
    }),
});

// Helper: log an audit entry
async function logAudit(workspaceId: number, userId: number, action: "create" | "update" | "delete" | "archive" | "restore", entity: string, entityId: number, changes: any) {
  try {
    const db = await getDb();
    await db!.insert(auditLog).values({
      workspaceId,
      userId,
      action,
      entity,
      entityId,
      changes: changes ? JSON.stringify(changes) : null,
    });
  } catch (e) {
    console.error("Failed to log audit:", e);
  }
}

export { logAudit };

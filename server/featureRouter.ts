import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { requireWorkspaceId } from "./workspaceMiddleware";
import {
  contractClins, contractModifications, keyPersonnel, complianceMatrix,
  auditLog, workspaceSettings, workspaceMembers, invoices, payments, contracts,
  aiFindings, aiRuns, tasks, proposalTeamAssignments
} from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

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

import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getContract, getDb } from "./db";
import { enforceAction } from "./rbacMiddleware";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { logAudit } from "./featureRouter";
import {
  complianceItems,
  contractClins,
  contractModifications,
  deliverables,
  fileLinks,
  files,
  invoices,
  keyPersonnel,
  obligations,
  tasks,
} from "../drizzle/schema";

async function requireContractInWorkspace(contractId: number, workspaceId: number) {
  const contract = await getContract(contractId, workspaceId);
  if (!contract) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found." });
  }
  return contract;
}

async function requireContractManager(userId: number, contractId: number) {
  const { wsId } = await enforceAction(userId, "manage_contracts");
  const contract = await requireContractInWorkspace(contractId, wsId);
  return { wsId, contract };
}

const deliverableStatus = z.enum([
  "not_started",
  "in_progress",
  "submitted",
  "accepted",
  "rejected",
  "overdue",
]);

const modificationStatus = z.enum(["draft", "submitted", "approved", "rejected"]);

export const contractOperationsRouter = router({
  summary: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .query(async ({ ctx, input }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const contract = await requireContractInWorkspace(input.contractId, wsId);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available." });

      const contractWhere = (table: any) => and(eq(table.workspaceId, wsId), eq(table.contractId, input.contractId));
      const [
        deliverableRows,
        obligationRows,
        complianceRows,
        modificationRows,
        clinRows,
        personnelRows,
        invoiceRows,
        contractTasks,
        directFiles,
        linkedFiles,
      ] = await Promise.all([
        db.select().from(deliverables).where(contractWhere(deliverables)),
        db.select().from(obligations).where(contractWhere(obligations)),
        db.select().from(complianceItems).where(contractWhere(complianceItems)),
        db.select().from(contractModifications).where(contractWhere(contractModifications)),
        db.select().from(contractClins).where(contractWhere(contractClins)),
        db.select().from(keyPersonnel).where(contractWhere(keyPersonnel)),
        db.select().from(invoices).where(and(eq(invoices.workspaceId, wsId), eq(invoices.contractId, input.contractId))),
        db.select().from(tasks).where(and(
          eq(tasks.workspaceId, wsId),
          eq(tasks.linkedRecordType, "contract"),
          eq(tasks.linkedRecordId, input.contractId),
        )),
        db.select().from(files).where(and(
          eq(files.workspaceId, wsId),
          eq(files.linkedRecordType, "contract"),
          eq(files.linkedRecordId, input.contractId),
        )),
        db.select().from(fileLinks).where(and(
          eq(fileLinks.workspaceId, wsId),
          eq(fileLinks.targetType, "contract"),
          eq(fileLinks.targetId, input.contractId),
        )),
      ]);

      const linkedIds = new Set(linkedFiles.map((link) => link.fileId));
      let linkedFileRows: typeof directFiles = [];
      if (linkedIds.size > 0) {
        const workspaceFiles = await db.select().from(files).where(eq(files.workspaceId, wsId));
        linkedFileRows = workspaceFiles.filter((file) => linkedIds.has(file.id));
      }
      const fileMap = new Map<number, (typeof directFiles)[number]>();
      for (const file of [...directFiles, ...linkedFileRows]) fileMap.set(file.id, file);
      const contractFiles = Array.from(fileMap.values()).filter((file) => !file.deletedAt);

      const now = Date.now();
      const overdueDeliverables = deliverableRows.filter((row) =>
        row.status !== "accepted" && !!row.dueDate && new Date(row.dueDate).getTime() < now,
      );
      const rejectedDeliverables = deliverableRows.filter((row) => row.status === "rejected");
      const acceptedDeliverables = deliverableRows.filter((row) => row.status === "accepted");
      const overdueObligations = obligationRows.filter((row) =>
        row.status !== "completed" && row.status !== "waived" && !!row.dueDate && new Date(row.dueDate).getTime() < now,
      );
      const complianceRisks = complianceRows.filter((row) => row.status === "non_compliant" || row.status === "at_risk");
      const pendingMods = modificationRows.filter((row) => row.status === "draft" || row.status === "submitted");
      const openTasks = contractTasks.filter((row) => !row.deletedAt && row.status !== "done" && row.status !== "cancelled");
      const criticalTasks = openTasks.filter((row) => row.priority === "critical" || row.priority === "high");
      const governingDocuments = contractFiles.filter((file) => file.isGoverningDocument || file.category === "governing");
      const qaspDocuments = contractFiles.filter((file) => {
        const searchable = `${file.name} ${file.category || ""} ${file.notes || ""}`.toLowerCase();
        return searchable.includes("qasp") || searchable.includes("quality assurance surveillance");
      });
      const evidenceFiles = contractFiles.filter((file) => file.category === "evidence" || file.category === "deliverable");

      const blockers: string[] = [];
      if (governingDocuments.length === 0) blockers.push("No governing award document is identified for this contract.");
      if (deliverableRows.length === 0) blockers.push("No contract deliverables have been established from the governing award.");
      if (overdueDeliverables.length > 0) blockers.push(`${overdueDeliverables.length} deliverable(s) are overdue.`);
      if (rejectedDeliverables.length > 0) blockers.push(`${rejectedDeliverables.length} deliverable(s) are rejected and require correction.`);
      if (overdueObligations.length > 0) blockers.push(`${overdueObligations.length} contract obligation(s) are overdue.`);
      if (complianceRisks.length > 0) blockers.push(`${complianceRisks.length} compliance item(s) are at risk or non-compliant.`);
      if (criticalTasks.length > 0) blockers.push(`${criticalTasks.length} high/critical operational task(s) remain open.`);
      if (pendingMods.length > 0) blockers.push(`${pendingMods.length} contract modification(s) are not yet approved/rejected.`);

      return {
        contract: {
          id: contract.id,
          title: contract.title,
          contractNumber: contract.contractNumber,
          status: contract.status,
          health: contract.health,
        },
        documents: {
          total: contractFiles.length,
          governing: governingDocuments.length,
          evidence: evidenceFiles.length,
          qaspIdentified: qaspDocuments.length > 0,
        },
        deliverables: {
          total: deliverableRows.length,
          accepted: acceptedDeliverables.length,
          overdue: overdueDeliverables.length,
          rejected: rejectedDeliverables.length,
        },
        obligations: {
          total: obligationRows.length,
          overdue: overdueObligations.length,
        },
        compliance: {
          total: complianceRows.length,
          risks: complianceRisks.length,
        },
        modifications: {
          total: modificationRows.length,
          pending: pendingMods.length,
          approved: modificationRows.filter((row) => row.status === "approved").length,
        },
        clins: { total: clinRows.length },
        personnel: { total: personnelRows.length },
        tasks: {
          open: openTasks.length,
          highOrCritical: criticalTasks.length,
        },
        invoices: {
          total: invoiceRows.filter((row) => !row.deletedAt).length,
          drafts: invoiceRows.filter((row) => !row.deletedAt && row.status === "draft").length,
          submitted: invoiceRows.filter((row) => !row.deletedAt && row.status === "submitted").length,
        },
        invoiceReadiness: {
          status: blockers.length > 0 ? "blocked" as const : "review_required" as const,
          blockers,
          requiresManualConfirmation: true,
          message: blockers.length > 0
            ? "Resolve operational blockers before treating this contract as invoice-ready."
            : "No automated blockers were detected. A contract manager must still confirm the governing award, acceptance evidence, billing period, CLIN/funding, and invoice instructions before submission.",
        },
      };
    }),

  setDeliverableStatus: protectedProcedure
    .input(z.object({
      contractId: z.number(),
      deliverableId: z.number(),
      status: deliverableStatus,
    }))
    .mutation(async ({ ctx, input }) => {
      const { wsId } = await requireContractManager(ctx.user.id, input.contractId);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available." });
      const [existing] = await db.select().from(deliverables).where(and(
        eq(deliverables.id, input.deliverableId),
        eq(deliverables.workspaceId, wsId),
        eq(deliverables.contractId, input.contractId),
      )).limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Deliverable not found." });

      const update: any = { status: input.status };
      if (input.status === "submitted" && !existing.submittedAt) update.submittedAt = new Date();
      if (input.status === "accepted") {
        update.acceptedAt = new Date();
        if (!existing.submittedAt) update.submittedAt = new Date();
      }
      if (input.status === "rejected") update.acceptedAt = null;

      await db.update(deliverables).set(update).where(and(
        eq(deliverables.id, input.deliverableId),
        eq(deliverables.workspaceId, wsId),
        eq(deliverables.contractId, input.contractId),
      ));
      try {
        await logAudit(wsId, ctx.user.id, "update", "deliverables", input.deliverableId, {
          contractId: input.contractId,
          previousStatus: existing.status,
          newStatus: input.status,
        });
      } catch {}
      return { success: true, previousStatus: existing.status, status: input.status };
    }),

  setModificationStatus: protectedProcedure
    .input(z.object({
      contractId: z.number(),
      modificationId: z.number(),
      status: modificationStatus,
    }))
    .mutation(async ({ ctx, input }) => {
      const { wsId } = await requireContractManager(ctx.user.id, input.contractId);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available." });
      const [existing] = await db.select().from(contractModifications).where(and(
        eq(contractModifications.id, input.modificationId),
        eq(contractModifications.workspaceId, wsId),
        eq(contractModifications.contractId, input.contractId),
      )).limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Contract modification not found." });

      await db.update(contractModifications).set({ status: input.status }).where(and(
        eq(contractModifications.id, input.modificationId),
        eq(contractModifications.workspaceId, wsId),
        eq(contractModifications.contractId, input.contractId),
      ));
      try {
        await logAudit(wsId, ctx.user.id, "update", "contractModification", input.modificationId, {
          contractId: input.contractId,
          previousStatus: existing.status,
          newStatus: input.status,
        });
      } catch {}
      return { success: true, previousStatus: existing.status, status: input.status };
    }),
});

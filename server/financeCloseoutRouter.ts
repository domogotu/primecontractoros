import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getContract, getDb, getInsertId } from "./db";
import { enforceAction } from "./rbacMiddleware";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { logAudit } from "./featureRouter";
import {
  closeoutBlockingItems,
  closeoutRecords,
  deliverables,
  invoicePaymentLinks,
  invoiceStatusHistory,
  invoices,
  payments,
  tasks,
} from "../drizzle/schema";

async function requireContract(contractId: number, workspaceId: number) {
  const contract = await getContract(contractId, workspaceId);
  if (!contract) throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found." });
  return contract;
}

const invoiceTransition = z.enum([
  "draft",
  "ready_for_review",
  "approved",
  "submitted",
  "partially_paid",
  "paid",
  "disputed",
  "void",
  "overdue",
  "rejected",
]);

const allowedTransitions: Record<string, string[]> = {
  draft: ["ready_for_review", "void"],
  ready_for_review: ["draft", "approved", "rejected"],
  approved: ["ready_for_review", "submitted", "void"],
  submitted: ["partially_paid", "paid", "disputed", "overdue"],
  partially_paid: ["paid", "disputed", "overdue"],
  overdue: ["partially_paid", "paid", "disputed"],
  disputed: ["submitted", "partially_paid", "paid", "void"],
  rejected: ["draft", "ready_for_review", "void"],
  paid: [],
  void: [],
};

export const financeCloseoutRouter = router({
  contractSummary: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .query(async ({ ctx, input }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const contract = await requireContract(input.contractId, wsId);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available." });

      const [invoiceRows, paymentRows, deliverableRows, taskRows, closeoutRows] = await Promise.all([
        db.select().from(invoices).where(and(eq(invoices.workspaceId, wsId), eq(invoices.contractId, input.contractId))),
        db.select().from(payments).where(and(eq(payments.workspaceId, wsId), eq(payments.contractId, input.contractId))),
        db.select().from(deliverables).where(and(eq(deliverables.workspaceId, wsId), eq(deliverables.contractId, input.contractId))),
        db.select().from(tasks).where(and(eq(tasks.workspaceId, wsId), eq(tasks.linkedRecordType, "contract"), eq(tasks.linkedRecordId, input.contractId))),
        db.select().from(closeoutRecords).where(and(eq(closeoutRecords.workspaceId, wsId), eq(closeoutRecords.contractId, input.contractId))),
      ]);

      const activeInvoices = invoiceRows.filter((row) => !row.deletedAt);
      const invoiceIds = new Set(activeInvoices.map((row) => row.id));
      const allLinks = await db.select().from(invoicePaymentLinks).where(eq(invoicePaymentLinks.workspaceId, wsId));
      const links = allLinks.filter((row) => invoiceIds.has(row.invoiceId));
      const invoiced = activeInvoices.reduce((sum, row) => sum + Number(row.amount || 0), 0);
      const paidApplied = links.reduce((sum, row) => sum + Number(row.amountApplied || 0), 0);
      const paymentTotal = paymentRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
      const unpaidInvoices = activeInvoices.filter((row) => !["paid", "void"].includes(row.status || "draft"));
      const deliverablesComplete = deliverableRows.length > 0 && deliverableRows.every((row) => row.status === "accepted");
      const openTasks = taskRows.filter((row) => !row.deletedAt && !["done", "cancelled"].includes(row.status || "todo"));
      const closeout = closeoutRows[0] || null;

      let closeoutBlockers: typeof closeoutBlockingItems.$inferSelect[] = [];
      if (closeout) {
        closeoutBlockers = await db.select().from(closeoutBlockingItems).where(and(
          eq(closeoutBlockingItems.workspaceId, wsId),
          eq(closeoutBlockingItems.closeoutId, closeout.id),
        ));
      }
      const openCloseoutBlockers = closeoutBlockers.filter((row) => row.status === "open");
      const blockers: string[] = [];
      if (!deliverablesComplete) blockers.push("All established contract deliverables must be accepted before closeout can be completed.");
      if (openTasks.length > 0) blockers.push(`${openTasks.length} contract task(s) remain open.`);
      if (unpaidInvoices.length > 0) blockers.push(`${unpaidInvoices.length} invoice(s) remain financially unresolved.`);
      if (openCloseoutBlockers.length > 0) blockers.push(`${openCloseoutBlockers.length} explicit closeout blocker(s) remain open.`);

      return {
        contract: { id: contract.id, title: contract.title, status: contract.status },
        finance: {
          invoiceCount: activeInvoices.length,
          invoiced,
          paymentTotal,
          paidApplied,
          unappliedPayments: Math.max(0, paymentTotal - paidApplied),
          outstanding: Math.max(0, invoiced - paidApplied),
          unresolvedInvoiceCount: unpaidInvoices.length,
        },
        closeout: {
          record: closeout,
          blockers,
          readyForManagerReview: blockers.length === 0,
          requiresManualConfirmation: true,
        },
      };
    }),

  transitionInvoice: protectedProcedure
    .input(z.object({ invoiceId: z.number(), newStatus: invoiceTransition, notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { wsId } = await enforceAction(ctx.user.id, "manage_invoices");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available." });
      const [invoice] = await db.select().from(invoices).where(and(eq(invoices.id, input.invoiceId), eq(invoices.workspaceId, wsId))).limit(1);
      if (!invoice || invoice.deletedAt) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found." });
      const current = invoice.status || "draft";
      if (!allowedTransitions[current]?.includes(input.newStatus)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Invoice cannot move directly from ${current} to ${input.newStatus}.` });
      }
      if (invoice.contractId) await requireContract(invoice.contractId, wsId);
      await db.update(invoices).set({ status: input.newStatus }).where(and(eq(invoices.id, input.invoiceId), eq(invoices.workspaceId, wsId)));
      await db.insert(invoiceStatusHistory).values({
        invoiceId: input.invoiceId,
        workspaceId: wsId,
        oldStatus: current,
        newStatus: input.newStatus,
        changedBy: ctx.user.id,
        notes: input.notes,
      });
      try { await logAudit(wsId, ctx.user.id, "update", "invoices", input.invoiceId, { oldStatus: current, newStatus: input.newStatus, notes: input.notes }); } catch {}
      return { success: true, oldStatus: current, newStatus: input.newStatus };
    }),

  startCloseout: protectedProcedure
    .input(z.object({ contractId: z.number(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { wsId } = await enforceAction(ctx.user.id, "manage_contracts");
      await requireContract(input.contractId, wsId);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available." });
      const [existing] = await db.select().from(closeoutRecords).where(and(eq(closeoutRecords.workspaceId, wsId), eq(closeoutRecords.contractId, input.contractId))).limit(1);
      if (existing) return { success: true, closeoutId: existing.id, reused: true };
      const result = await db.insert(closeoutRecords).values({
        workspaceId: wsId,
        contractId: input.contractId,
        status: "in_progress",
        initiatedBy: ctx.user.id,
        notes: input.notes,
      });
      const closeoutId = getInsertId(result);
      try { await logAudit(wsId, ctx.user.id, "create", "closeout", closeoutId, { contractId: input.contractId }); } catch {}
      return { success: true, closeoutId, reused: false };
    }),
});

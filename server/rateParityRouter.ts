/**
 * Rate Parity Testing Router
 * Compares rates across proposals, contracts, invoices, payments, subcontractors
 */
import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { getDb } from "./db";
import {
  rateParityChecks, contracts, invoices, payments, proposals
} from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const rateParityRouter = router({
  /**
   * Run a parity check between two rate sources
   */
  runCheck: protectedProcedure
    .input(z.object({
      source: z.string(),
      sourceId: z.number().optional(),
      target: z.string(),
      targetId: z.number().optional(),
      rateType: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return { status: "error", message: "Database unavailable" };

      // Get rates from source and target
      const sourceRate = await getRateFromSource(db, workspaceId, input.source, input.sourceId);
      const targetRate = await getRateFromSource(db, workspaceId, input.target, input.targetId);

      if (sourceRate === null || targetRate === null) {
        return { status: "error", message: "Could not determine rates for comparison" };
      }

      const variance = Math.abs(sourceRate - targetRate);
      const variancePercent = sourceRate > 0 ? (variance / sourceRate) * 100 : 0;

      let status: "pass" | "fail" | "warning" = "pass";
      if (variancePercent > 10) status = "fail";
      else if (variancePercent > 5) status = "warning";

      // Store the check result
      const [result] = await db.insert(rateParityChecks).values({
        workspaceId,
        source: input.source,
        sourceId: input.sourceId,
        sourceLabel: `${input.source} #${input.sourceId || "all"}`,
        target: input.target,
        targetId: input.targetId,
        targetLabel: `${input.target} #${input.targetId || "all"}`,
        rateType: input.rateType || "standard",
        expectedRate: sourceRate.toFixed(2),
        actualRate: targetRate.toFixed(2),
        variance: variance.toFixed(2),
        variancePercent: variancePercent.toFixed(2),
        status,
      }).$returningId();

      return {
        id: result.id,
        status,
        expectedRate: sourceRate,
        actualRate: targetRate,
        variance,
        variancePercent,
        message: status === "pass"
          ? "Rates are within acceptable range"
          : status === "warning"
            ? `Variance of ${variancePercent.toFixed(1)}% detected - review recommended`
            : `Rate mismatch: ${variancePercent.toFixed(1)}% variance exceeds threshold`,
      };
    }),

  /**
   * Get all parity check results
   */
  getResults: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return { checks: [], summary: { total: 0, pass: 0, fail: 0, warning: 0 } };

      let query = db.select().from(rateParityChecks)
        .where(eq(rateParityChecks.workspaceId, workspaceId))
        .orderBy(desc(rateParityChecks.checkedAt))
        .limit(input.limit);

      const checks = await query;

      const summary = {
        total: checks.length,
        pass: checks.filter(c => c.status === "pass").length,
        fail: checks.filter(c => c.status === "fail").length,
        warning: checks.filter(c => c.status === "warning").length,
      };

      return { checks, summary };
    }),

  /**
   * Get active alerts (failed or warning checks)
   */
  getAlerts: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const db = await getDb();
    if (!db) return [];

    const alerts = await db.select().from(rateParityChecks)
      .where(and(
        eq(rateParityChecks.workspaceId, workspaceId),
        sql`${rateParityChecks.status} IN ('fail', 'warning')`,
        sql`${rateParityChecks.resolvedAt} IS NULL`
      ))
      .orderBy(desc(rateParityChecks.checkedAt))
      .limit(20);

    return alerts;
  }),

  /**
   * Run all parity checks for the workspace
   */
  runAllChecks: protectedProcedure.mutation(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const db = await getDb();
    if (!db) return { checksRun: 0, issues: 0 };

    // Get all contracts with values
    const allContracts = await db.select().from(contracts)
      .where(and(eq(contracts.workspaceId, workspaceId), sql`${contracts.value} IS NOT NULL`));

    // Get all invoices
    const allInvoices = await db.select().from(invoices)
      .where(eq(invoices.workspaceId, workspaceId));

    // Get all payments
    const allPayments = await db.select().from(payments)
      .where(eq(payments.workspaceId, workspaceId));

    let checksRun = 0;
    let issues = 0;

    // Check invoice amounts against contract values
    for (const contract of allContracts) {
      const contractInvoices = allInvoices.filter(i => i.contractId === contract.id);
      if (contractInvoices.length === 0) continue;

      const totalInvoiced = contractInvoices.reduce((sum, i) => sum + parseFloat(String(i.amount) || "0"), 0);
      const contractValue = parseFloat(String(contract.value) || "0");

      if (contractValue > 0) {
        const variance = Math.abs(totalInvoiced - contractValue);
        const variancePercent = (variance / contractValue) * 100;

        let status: "pass" | "fail" | "warning" = "pass";
        if (totalInvoiced > contractValue) status = "fail";
        else if (variancePercent > 90) status = "warning"; // Near ceiling

        await db.insert(rateParityChecks).values({
          workspaceId,
          source: "contract",
          sourceId: contract.id,
          sourceLabel: contract.title,
          target: "invoices_total",
          targetId: contract.id,
          targetLabel: `Total invoiced for ${contract.title}`,
          rateType: "contract_ceiling",
          expectedRate: contractValue.toFixed(2),
          actualRate: totalInvoiced.toFixed(2),
          variance: variance.toFixed(2),
          variancePercent: variancePercent.toFixed(2),
          status,
        });

        checksRun++;
        if (status !== "pass") issues++;
      }
    }

    // Check payment amounts against invoice amounts
    for (const invoice of allInvoices) {
      const invoicePayments = allPayments.filter(p => p.invoiceId === invoice.id);
      if (invoicePayments.length === 0) continue;

      const totalPaid = invoicePayments.reduce((sum, p) => sum + parseFloat(String(p.amount) || "0"), 0);
      const invoiceAmount = parseFloat(String(invoice.amount) || "0");

      if (invoiceAmount > 0) {
        const variance = Math.abs(totalPaid - invoiceAmount);
        const variancePercent = (variance / invoiceAmount) * 100;

        let status: "pass" | "fail" | "warning" = "pass";
        if (variancePercent > 1) status = totalPaid > invoiceAmount ? "fail" : "warning";

        await db.insert(rateParityChecks).values({
          workspaceId,
          source: "invoice",
          sourceId: invoice.id,
          sourceLabel: `Invoice ${invoice.invoiceNumber}`,
          target: "payments_total",
          targetId: invoice.id,
          targetLabel: `Payments for Invoice ${invoice.invoiceNumber}`,
          rateType: "invoice_payment",
          expectedRate: invoiceAmount.toFixed(2),
          actualRate: totalPaid.toFixed(2),
          variance: variance.toFixed(2),
          variancePercent: variancePercent.toFixed(2),
          status,
        });

        checksRun++;
        if (status !== "pass") issues++;
      }
    }

    return { checksRun, issues };
  }),

  /**
   * Resolve an alert
   */
  resolveAlert: protectedProcedure
    .input(z.object({ checkId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      await db.update(rateParityChecks)
        .set({ resolvedAt: new Date() })
        .where(eq(rateParityChecks.id, input.checkId));

      return { success: true };
    }),
});

// Helper to get rate from a source
async function getRateFromSource(db: any, workspaceId: number, source: string, sourceId?: number): Promise<number | null> {
  try {
    switch (source) {
      case "contract": {
        if (!sourceId) return null;
        const [contract] = await db.select().from(contracts)
          .where(and(eq(contracts.id, sourceId), eq(contracts.workspaceId, workspaceId)));
        return contract?.value ? parseFloat(String(contract.value)) : null;
      }
      case "invoice": {
        if (!sourceId) return null;
        const [invoice] = await db.select().from(invoices)
          .where(and(eq(invoices.id, sourceId), eq(invoices.workspaceId, workspaceId)));
        return invoice?.amount ? parseFloat(String(invoice.amount)) : null;
      }
      case "payment": {
        if (!sourceId) return null;
        const [payment] = await db.select().from(payments)
          .where(and(eq(payments.id, sourceId), eq(payments.workspaceId, workspaceId)));
        return payment?.amount ? parseFloat(String(payment.amount)) : null;
      }
      case "proposal": {
        if (!sourceId) return null;
        const [proposal] = await db.select().from(proposals)
          .where(and(eq(proposals.id, sourceId), eq(proposals.workspaceId, workspaceId)));
        return null; // Proposals don't have a direct value field in this schema
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

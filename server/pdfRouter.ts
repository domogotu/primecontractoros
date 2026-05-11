import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { invoices, contracts, contractClins, contractModifications, keyPersonnel, capabilityStatements } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import {
  generateFinanceSummaryPDF,
  generateContractSummaryPDF,
  generateCapabilityStatementPDF,
} from "./services/pdfExport";
import { storagePut } from "./storage";

async function requireWorkspaceId(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { workspaceMembers } = await import("../drizzle/schema");
  const [member] = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, userId));
  if (!member) throw new Error("No workspace found");
  return member.workspaceId;
}

export const pdfRouter = router({
  exportFinanceSummary: protectedProcedure.mutation(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.workspaceId, workspaceId));

    const totalInvoiced = allInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    const totalPaid = allInvoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    const totalOutstanding = totalInvoiced - totalPaid;

    const pdfBuffer = await generateFinanceSummaryPDF({
      workspaceName: "Reed's Solutions LLC",
      generatedAt: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      invoices: allInvoices.map((inv) => ({
        number: inv.invoiceNumber || `INV-${inv.id}`,
        client: (inv as any).clientName || "—",
        amount: Number(inv.amount || 0),
        status: inv.status || "draft",
        dueDate: inv.dueDate
          ? new Date(inv.dueDate).toLocaleDateString()
          : "—",
      })),
    });

    const key = `exports/finance-summary-${Date.now()}.pdf`;
    const { url } = await storagePut(key, pdfBuffer, "application/pdf");
    return { url, filename: `finance-summary-${new Date().toISOString().split("T")[0]}.pdf` };
  }),

  exportContractSummary: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [contract] = await db
        .select()
        .from(contracts)
        .where(and(eq(contracts.id, input.contractId), eq(contracts.workspaceId, workspaceId)));

      if (!contract) throw new Error("Contract not found");

      const clinsList = await db
        .select()
        .from(contractClins)
        .where(eq(contractClins.contractId, input.contractId));

      const contractMods = await db
        .select()
        .from(contractModifications)
        .where(eq(contractModifications.contractId, input.contractId));

      const contractPersonnel = await db
        .select()
        .from(keyPersonnel)
        .where(eq(keyPersonnel.contractId, input.contractId));

      const pdfBuffer = await generateContractSummaryPDF({
        contractNumber: contract.contractNumber || `C-${contract.id}`,
        title: contract.title,
        agency: contract.agency || "—",
        status: contract.status || "active",
        startDate: contract.startDate
          ? new Date(contract.startDate).toLocaleDateString()
          : "—",
        endDate: contract.endDate
          ? new Date(contract.endDate).toLocaleDateString()
          : "—",
        totalValue: Number(contract.value || 0),
        clins: clinsList.map((c) => ({
          number: c.clinNumber || `${c.id}`,
          description: c.description || "",
          quantity: Number(c.quantity || 0),
          unitPrice: Number(c.unitPrice || 0),
          total: Number(c.totalValue || 0),
        })),
        keyPersonnel: contractPersonnel.map((p) => ({
          name: p.name,
          role: p.role || "—",
        })),
        modifications: contractMods.map((m) => ({
          number: m.modNumber || `${m.id}`,
          description: m.description || "",
          amount: Number(m.valueChange || 0),
          date: m.effectiveDate
            ? new Date(m.effectiveDate).toLocaleDateString()
            : "—",
        })),
      });

      const key = `exports/contract-${contract.contractNumber || contract.id}-${Date.now()}.pdf`;
      const { url } = await storagePut(key, pdfBuffer, "application/pdf");
      return { url, filename: `contract-${contract.contractNumber || contract.id}.pdf` };
    }),

  exportCapabilityStatement: protectedProcedure
    .input(z.object({ statementId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [statement] = await db
        .select()
        .from(capabilityStatements)
        .where(and(eq(capabilityStatements.id, input.statementId), eq(capabilityStatements.workspaceId, workspaceId)));

      if (!statement) throw new Error("Capability statement not found");

      const pdfBuffer = await generateCapabilityStatementPDF({
        title: statement.title,
        companyOverview: statement.content || "",
        coreCompetencies: statement.differentiators || "",
        pastPerformance: statement.pastPerformance || "",
        naicsCodes: statement.naicsCodes || "",
        certifications: "",
        contactInfo: "",
      });

      const key = `exports/capability-statement-${statement.id}-${Date.now()}.pdf`;
      const { url } = await storagePut(key, pdfBuffer, "application/pdf");
      return { url, filename: `capability-statement-${statement.title.replace(/\s+/g, "-").toLowerCase()}.pdf` };
    }),
});

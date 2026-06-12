import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { enforcePermission, enforceAction } from "./rbacMiddleware";
import { logAudit } from "./featureRouter";
import { dispatchWebhookEvent } from "./services/webhookDispatch";
import { sendInvoiceAlert, sendDeadlineReminder } from "./services/email";
import {
  listFiles, createFile, deleteFile, getFileById, updateFile,
  listContacts, createContact, updateContact, deleteContact, getContactById,
  listMessages, createMessage, deleteMessage,
  listInvoices, createInvoice, updateInvoice, deleteInvoice, getInvoiceById,
  listPayments, createPayment, deletePayment, getPaymentById,
  listTasks, createTask, updateTask, deleteTask,
  listAlerts, createAlert, dismissAlert, markAlertRead, markAllAlertsRead,
  listDeliverables, createDeliverable, updateDeliverable, deleteDeliverable,
  listDeadlines, createDeadline, updateDeadline, deleteDeadline,
  listObligations, createObligation, updateObligation, deleteObligation,
  listComplianceItems, createComplianceItem, updateComplianceItem, deleteComplianceItem,
  listNotes, createNote, updateNote, deleteNote,
  listCapabilityStatements, createCapabilityStatement, updateCapabilityStatement, deleteCapabilityStatement,
  listTemplates, createTemplate, updateTemplate, deleteTemplate,
  listCloseoutRecords, createCloseoutRecord, updateCloseoutRecord,
  listLessonsLearned, createLessonLearned, deleteLessonLearned,
  listLossReviews, createLossReview, updateLossReview,
  linkPaymentToInvoice, getPaymentLinksForInvoice,
  addInvoiceStatusHistory, getInvoiceStatusHistory,
  createContactLink, getContactLinksForRecord,
  createFollowup, listFollowups, updateFollowup,
  createCloseoutBlocker, listCloseoutBlockers, updateCloseoutBlocker,
  createFinanceNote, listFinanceNotes,
  createFileVersion, listFileVersions, listAllFileVersionsForWorkspace,
  createContractRequirement, listContractRequirements, updateContractRequirement,
  listInvoiceLineItems, createInvoiceLineItem, updateInvoiceLineItem, deleteInvoiceLineItem,
  listInvoiceChecklistItems, createInvoiceChecklistItem, updateInvoiceChecklistItem, deleteInvoiceChecklistItem,
  listInvoiceIssues, createInvoiceIssue, updateInvoiceIssue, deleteInvoiceIssue,
  listPaymentApplications, createPaymentApplication, deletePaymentApplication, listAllPaymentApplications,
} from "./entityDb";

// Helper: get workspace ID from user context (resolves from DB)
async function getWorkspaceId(ctx: any): Promise<number> {
  if (!ctx.user?.id) throw new Error("Not authenticated");
  return requireWorkspaceId(ctx.user.id);
}

// RBAC helpers: enforce write/delete permissions and return wsId
async function requireWrite(ctx: any): Promise<number> {
  if (!ctx.user?.id) throw new Error("Not authenticated");
  const { wsId } = await enforcePermission(ctx.user.id, "write");
  return wsId;
}

async function requireDelete(ctx: any): Promise<number> {
  if (!ctx.user?.id) throw new Error("Not authenticated");
  const { wsId } = await enforcePermission(ctx.user.id, "delete");
  return wsId;
}

// Domain-specific RBAC helpers
async function requireFinanceWrite(ctx: any): Promise<number> {
  if (!ctx.user?.id) throw new Error("Not authenticated");
  const { wsId } = await enforceAction(ctx.user.id, "manage_invoices");
  return wsId;
}

async function requireFinanceDelete(ctx: any): Promise<number> {
  if (!ctx.user?.id) throw new Error("Not authenticated");
  const { wsId } = await enforceAction(ctx.user.id, "manage_invoices");
  return wsId;
}

export const filesRouter = router({
  list: protectedProcedure
    .input(z.object({ linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional(), isGoverningDocument: z.boolean().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return listFiles(wsId, input?.linkedRecordType, input?.linkedRecordId);
    }),
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return getFileById(input.id, wsId);
    }),
  create: protectedProcedure
    .input(z.object({ name: z.string(), fileKey: z.string(), url: z.string(), mimeType: z.string().optional(), size: z.number().optional(), linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional(), category: z.string().optional(), isGoverningDocument: z.boolean().optional(), notes: z.string().optional(), documentDate: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "create", "files", 0, input); } catch {}
      return createFile({ ...input, workspaceId: wsId, uploadedBy: ctx.user?.id, documentDate: input.documentDate ? new Date(input.documentDate) : null });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string().optional(), category: z.string().optional(), linkedRecordType: z.string().nullable().optional(), linkedRecordId: z.number().nullable().optional(), isGoverningDocument: z.boolean().optional(), documentDate: z.string().nullable().optional(), notes: z.string().nullable().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { id, ...data } = input;
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.linkedRecordType !== undefined) updateData.linkedRecordType = data.linkedRecordType;
      if (data.linkedRecordId !== undefined) updateData.linkedRecordId = data.linkedRecordId;
      if (data.isGoverningDocument !== undefined) updateData.isGoverningDocument = data.isGoverningDocument;
      if (data.documentDate !== undefined) updateData.documentDate = data.documentDate ? new Date(data.documentDate) : null;
      if (data.notes !== undefined) updateData.notes = data.notes;
      try { await logAudit(wsId, ctx.user.id, "update", "files", id, updateData); } catch {}
      return updateFile(id, wsId, updateData);
    }),
  toggleGoverning: protectedProcedure
    .input(z.object({ id: z.number(), isGoverningDocument: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "update", "files", input.id, { isGoverningDocument: input.isGoverningDocument }); } catch {}
      return updateFile(input.id, wsId, { isGoverningDocument: input.isGoverningDocument });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireDelete(ctx);
      try { await logAudit(wsId, ctx.user.id, "delete", "files", 0, null); } catch {}
      return deleteFile(input.id, wsId);
    }),
});

export const contactsRouter = router({
  list: protectedProcedure
    .input(z.object({ linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return listContacts(wsId, input?.linkedRecordType, input?.linkedRecordId);
    }),
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return getContactById(input.id, wsId);
    }),
  create: protectedProcedure
    .input(z.object({ firstName: z.string(), lastName: z.string(), email: z.string().optional(), phone: z.string().optional(), organization: z.string().optional(), title: z.string().optional(), role: z.string().optional(), linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "create", "contacts", 0, input); } catch {}
      return createContact({ ...input, workspaceId: wsId });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), firstName: z.string().optional(), lastName: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), organization: z.string().optional(), title: z.string().optional(), role: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { id, ...data } = input;
      try { await logAudit(wsId, ctx.user.id, "update", "contacts", 0, input); } catch {}
      return updateContact(id, wsId, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireDelete(ctx);
      try { await logAudit(wsId, ctx.user.id, "delete", "contacts", 0, null); } catch {}
      return deleteContact(input.id, wsId);
    }),
});

export const messagesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const wsId = await getWorkspaceId(ctx);
    return listMessages(wsId);
  }),
  create: protectedProcedure
    .input(z.object({ subject: z.string(), body: z.string(), recipientId: z.number().optional(), linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "create", "messages", 0, input); } catch {}
      return createMessage({ ...input, workspaceId: wsId, senderId: ctx.user?.id || 0 });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireDelete(ctx);
      try { await logAudit(wsId, ctx.user.id, "delete", "messages", 0, null); } catch {}
      return deleteMessage(input.id, wsId);
    }),
});

export const invoicesRouter = router({
  list: protectedProcedure
    .input(z.object({ contractId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return listInvoices(wsId, input?.contractId);
    }),
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return getInvoiceById(input.id, wsId);
    }),
  create: protectedProcedure
    .input(z.object({ contractId: z.number().optional(), invoiceNumber: z.string(), amount: z.string(), status: z.string().optional(), issuedDate: z.string().optional(), dueDate: z.string().optional(), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireFinanceWrite(ctx);
      const { issuedDate, dueDate, ...rest } = input;
      const result = await createInvoice({
        ...rest,
        workspaceId: wsId,
        issuedDate: issuedDate ? new Date(issuedDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
      // Send invoice alert email asynchronously
      if (ctx.user.email) {
        sendInvoiceAlert(
          wsId, ctx.user.email, input.invoiceNumber,
          input.amount, "Contract", "Created"
        ).catch(err => console.error("[Email] Invoice alert failed:", err));
      }
      try { await logAudit(wsId, ctx.user.id, "create", "invoices", 0, input); } catch {}
      dispatchWebhookEvent(wsId, "invoice.created", { invoiceNumber: input.invoiceNumber, amount: input.amount }).catch(() => {});
      return result;
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), invoiceNumber: z.string().optional(), amount: z.string().optional(), status: z.string().optional(), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireFinanceWrite(ctx);
      const { id, ...data } = input;
      try { await logAudit(wsId, ctx.user.id, "update", "invoices", 0, input); } catch {}
      return updateInvoice(id, wsId, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireFinanceDelete(ctx);
      try { await logAudit(wsId, ctx.user.id, "delete", "invoices", 0, null); } catch {}
      return deleteInvoice(input.id, wsId);
    }),
  updateStatus: protectedProcedure
    .input(z.object({ id: z.number(), oldStatus: z.string(), newStatus: z.string(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireFinanceWrite(ctx);
      await updateInvoice(input.id, wsId, { status: input.newStatus } as any);
      await addInvoiceStatusHistory({ invoiceId: input.id, oldStatus: input.oldStatus, newStatus: input.newStatus, changedBy: ctx.user.id, notes: input.notes });
      try { await logAudit(wsId, ctx.user.id, "delete", "invoices", input.id, null); } catch {}
      return { success: true };
    }),
  statusHistory: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ input }) => {
      return getInvoiceStatusHistory(input.invoiceId);
    }),
  paymentLinks: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ input }) => {
      return getPaymentLinksForInvoice(input.invoiceId);
    }),
  linkPayment: protectedProcedure
    .input(z.object({ invoiceId: z.number(), paymentId: z.number(), amount: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "create", "invoicePaymentLink", 0, input); } catch {}
      return linkPaymentToInvoice(input);
    }),
  // Line Items
  lineItems: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return listInvoiceLineItems(input.invoiceId, wsId);
    }),
  createLineItem: protectedProcedure
    .input(z.object({ invoiceId: z.number(), description: z.string(), quantity: z.string().optional(), unitPrice: z.string(), amount: z.string(), category: z.string().optional(), sortOrder: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "create", "invoiceLineItem", 0, input); } catch {}
      return createInvoiceLineItem({ ...input, workspaceId: wsId, quantity: input.quantity || "1" });
    }),
  updateLineItem: protectedProcedure
    .input(z.object({ id: z.number(), description: z.string().optional(), quantity: z.string().optional(), unitPrice: z.string().optional(), amount: z.string().optional(), category: z.string().optional(), sortOrder: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { id, ...data } = input;
      try { await logAudit(wsId, ctx.user.id, "update", "invoiceLineItem", id, data); } catch {}
      return updateInvoiceLineItem(id, wsId, data);
    }),
  deleteLineItem: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireDelete(ctx);
      try { await logAudit(wsId, ctx.user.id, "delete", "invoiceLineItem", input.id, null); } catch {}
      return deleteInvoiceLineItem(input.id, wsId);
    }),
  // Checklist Items
  checklistItems: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return listInvoiceChecklistItems(input.invoiceId, wsId);
    }),
  createChecklistItem: protectedProcedure
    .input(z.object({ invoiceId: z.number(), title: z.string(), description: z.string().optional(), required: z.boolean().optional(), sortOrder: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "create", "invoiceChecklistItem", 0, input); } catch {}
      return createInvoiceChecklistItem({ ...input, workspaceId: wsId });
    }),
  updateChecklistItem: protectedProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), required: z.boolean().optional(), completed: z.boolean().optional(), sortOrder: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { id, ...data } = input;
      const updateData: Record<string, any> = { ...data };
      if (input.completed === true) {
        updateData.completedBy = ctx.user.id;
        updateData.completedAt = new Date();
      } else if (input.completed === false) {
        updateData.completedBy = null;
        updateData.completedAt = null;
      }
      try { await logAudit(wsId, ctx.user.id, "update", "invoiceChecklistItem", id, data); } catch {}
      return updateInvoiceChecklistItem(id, wsId, updateData);
    }),
  deleteChecklistItem: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireDelete(ctx);
      try { await logAudit(wsId, ctx.user.id, "delete", "invoiceChecklistItem", input.id, null); } catch {}
      return deleteInvoiceChecklistItem(input.id, wsId);
    }),
  // Issues / Disputes
  issues: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return listInvoiceIssues(input.invoiceId, wsId);
    }),
  createIssue: protectedProcedure
    .input(z.object({ invoiceId: z.number(), title: z.string(), description: z.string().optional(), severity: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "create", "invoiceIssue", 0, input); } catch {}
      return createInvoiceIssue({ ...input, workspaceId: wsId, raisedBy: ctx.user.id });
    }),
  updateIssue: protectedProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), severity: z.string().optional(), status: z.string().optional(), resolution: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { id, ...data } = input;
      const updateData: Record<string, any> = { ...data };
      if (input.status === "resolved" || input.status === "closed") {
        updateData.resolvedBy = ctx.user.id;
        updateData.resolvedAt = new Date();
      }
      try { await logAudit(wsId, ctx.user.id, "update", "invoiceIssue", id, data); } catch {}
      return updateInvoiceIssue(id, wsId, updateData);
    }),
  deleteIssue: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireDelete(ctx);
      try { await logAudit(wsId, ctx.user.id, "delete", "invoiceIssue", input.id, null); } catch {}
      return deleteInvoiceIssue(input.id, wsId);
    }),
  // Support Documents (uses existing files system with linkedRecordType="invoice")
  supportDocs: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return listFiles(wsId, "invoice", input.invoiceId);
    }),
});

export const paymentsRouter = router({
  list: protectedProcedure
    .input(z.object({ contractId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return listPayments(wsId, input?.contractId);
    }),
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return getPaymentById(input.id, wsId);
    }),
  create: protectedProcedure
    .input(z.object({ invoiceId: z.number().optional(), contractId: z.number().optional(), amount: z.string(), paymentDate: z.string().optional(), method: z.string().optional(), reference: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireFinanceWrite(ctx);
      const { paymentDate, ...rest } = input;
      try { await logAudit(wsId, ctx.user.id, "create", "payments", 0, input); } catch {}
      return createPayment({
        ...rest,
        workspaceId: wsId,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireFinanceDelete(ctx);
      try { await logAudit(wsId, ctx.user.id, "delete", "payments", 0, null); } catch {}
      return deletePayment(input.id, wsId);
    }),
  // Payment Applications
  applications: protectedProcedure
    .input(z.object({ paymentId: z.number().optional(), invoiceId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return listPaymentApplications(wsId, input?.paymentId, input?.invoiceId);
    }),
  allApplications: protectedProcedure
    .query(async ({ ctx }) => {
      const wsId = await getWorkspaceId(ctx);
      return listAllPaymentApplications(wsId);
    }),
  applyToInvoice: protectedProcedure
    .input(z.object({ paymentId: z.number(), invoiceId: z.number(), amount: z.string(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "create", "paymentApplication", 0, input); } catch {}
      const result = await createPaymentApplication({ ...input, workspaceId: wsId });
      // Auto-update invoice status based on total applied
      const allApps = await listPaymentApplications(wsId, undefined, input.invoiceId);
      const totalApplied = allApps.reduce((sum: number, app: any) => sum + parseFloat(app.amount || "0"), 0);
      const invoice = await getInvoiceById(input.invoiceId, wsId);
      if (invoice) {
        const invoiceAmount = parseFloat(invoice.amount || "0");
        if (totalApplied >= invoiceAmount) {
          await updateInvoice(input.invoiceId, wsId, { status: "paid", paidDate: new Date() } as any);
          await addInvoiceStatusHistory({ invoiceId: input.invoiceId, oldStatus: invoice.status || "draft", newStatus: "paid", changedBy: ctx.user.id, notes: "Auto-updated: fully paid via payment application" });
        } else if (totalApplied > 0) {
          await updateInvoice(input.invoiceId, wsId, { status: "partially_paid" } as any);
          await addInvoiceStatusHistory({ invoiceId: input.invoiceId, oldStatus: invoice.status || "draft", newStatus: "partially_paid", changedBy: ctx.user.id, notes: `Auto-updated: $${totalApplied.toFixed(2)} of $${invoiceAmount.toFixed(2)} applied` });
        }
      }
      return result;
    }),
  removeApplication: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireDelete(ctx);
      try { await logAudit(wsId, ctx.user.id, "delete", "paymentApplication", input.id, null); } catch {}
      return deletePaymentApplication(input.id, wsId);
    }),
});

export const tasksRouter = router({
  list: protectedProcedure
    .input(z.object({ linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return listTasks(wsId, input?.linkedRecordType, input?.linkedRecordId);
    }),
  create: protectedProcedure
    .input(z.object({ title: z.string(), description: z.string().optional(), assignedTo: z.number().optional(), linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional(), priority: z.string().optional(), dueDate: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { dueDate, ...rest } = input;
      try { await logAudit(wsId, ctx.user.id, "create", "tasks", 0, input); } catch {}
      return createTask({
        ...rest,
        workspaceId: wsId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), status: z.string().optional(), priority: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { id, ...data } = input;
      try { await logAudit(wsId, ctx.user.id, "update", "tasks", 0, input); } catch {}
      return updateTask(id, wsId, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireDelete(ctx);
      try { await logAudit(wsId, ctx.user.id, "delete", "tasks", 0, null); } catch {}
      return deleteTask(input.id, wsId);
    }),
});

export const alertsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const wsId = await getWorkspaceId(ctx);
    return listAlerts(wsId);
  }),
  create: protectedProcedure
    .input(z.object({ title: z.string(), message: z.string().optional(), type: z.string().optional(), linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "create", "alerts", 0, input); } catch {}
      return createAlert({ ...input, workspaceId: wsId });
    }),
  dismiss: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "update", "alerts", 0, input); } catch {}
      return dismissAlert(input.id, wsId);
    }),
  markRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      return markAlertRead(input.id, wsId);
    }),
  markAllRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      const wsId = await requireWrite(ctx);
      return markAllAlertsRead(wsId);
    }),
});

export const deliverablesRouter = router({
  list: protectedProcedure
    .input(z.object({ contractId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return listDeliverables(wsId, input?.contractId);
    }),
  create: protectedProcedure
    .input(z.object({ contractId: z.number(), title: z.string(), description: z.string().optional(), dueDate: z.string().optional(), status: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { dueDate, ...rest } = input;
      try { await logAudit(wsId, ctx.user.id, "create", "deliverables", 0, input); } catch {}
      return createDeliverable({
        ...rest,
        workspaceId: wsId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), status: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { id, ...data } = input;
      try { await logAudit(wsId, ctx.user.id, "update", "deliverables", 0, input); } catch {}
      return updateDeliverable(id, wsId, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireDelete(ctx);
      try { await logAudit(wsId, ctx.user.id, "delete", "deliverables", 0, null); } catch {}
      return deleteDeliverable(input.id, wsId);
    }),
});

export const deadlinesRouter = router({
  list: protectedProcedure
    .input(z.object({ contractId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
    const wsId = await getWorkspaceId(ctx);
    return listDeadlines(wsId, input?.contractId);
  }),
  create: protectedProcedure
    .input(z.object({ title: z.string(), description: z.string().optional(), dueDate: z.string(), linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional(), priority: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { dueDate, ...rest } = input;
      const result = await createDeadline({
        ...rest,
        workspaceId: wsId,
        dueDate: new Date(dueDate),
      });
      // Send deadline reminder email asynchronously
      if (ctx.user.email) {
        const dueDateObj = new Date(dueDate);
        const daysLeft = Math.max(0, Math.ceil((dueDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
        sendDeadlineReminder(
          wsId, ctx.user.email, input.title,
          dueDateObj.toLocaleDateString(), input.linkedRecordType || "General",
          input.title, daysLeft
        ).catch(err => console.error("[Email] Deadline reminder failed:", err));
      }
      try { await logAudit(wsId, ctx.user.id, "create", "deadlines", 0, input); } catch {}
      return result;
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), priority: z.string().optional(), status: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { id, ...data } = input;
      try { await logAudit(wsId, ctx.user.id, "update", "deadlines", 0, input); } catch {}
      return updateDeadline(id, wsId, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireDelete(ctx);
      try { await logAudit(wsId, ctx.user.id, "delete", "deadlines", 0, null); } catch {}
      return deleteDeadline(input.id, wsId);
    }),
});

export const obligationsRouter = router({
  list: protectedProcedure
    .input(z.object({ contractId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return listObligations(wsId, input?.contractId);
    }),
  create: protectedProcedure
    .input(z.object({ contractId: z.number(), title: z.string(), description: z.string().optional(), obligationType: z.string().optional(), frequency: z.string().optional(), dueDate: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { dueDate, ...rest } = input;
      try { await logAudit(wsId, ctx.user.id, "create", "obligations", 0, input); } catch {}
      return createObligation({
        ...rest,
        workspaceId: wsId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), status: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { id, ...data } = input;
      try { await logAudit(wsId, ctx.user.id, "update", "obligations", 0, input); } catch {}
      return updateObligation(id, wsId, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireDelete(ctx);
      try { await logAudit(wsId, ctx.user.id, "delete", "obligations", 0, null); } catch {}
      return deleteObligation(input.id, wsId);
    }),
});

export const complianceRouter = router({
  list: protectedProcedure
    .input(z.object({ contractId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return listComplianceItems(wsId, input?.contractId);
    }),
  create: protectedProcedure
    .input(z.object({ contractId: z.number().optional(), title: z.string(), description: z.string().optional(), regulation: z.string().optional(), category: z.string().optional(), dueDate: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { dueDate, ...rest } = input;
      try { await logAudit(wsId, ctx.user.id, "create", "compliance", 0, input); } catch {}
      return createComplianceItem({
        ...rest,
        workspaceId: wsId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), regulation: z.string().optional(), category: z.string().optional(), status: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { id, ...data } = input;
      try { await logAudit(wsId, ctx.user.id, "update", "compliance", 0, input); } catch {}
      return updateComplianceItem(id, wsId, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireDelete(ctx);
      try { await logAudit(wsId, ctx.user.id, "delete", "compliance", 0, null); } catch {}
      return deleteComplianceItem(input.id, wsId);
    }),
});

export const notesRouter = router({
  list: protectedProcedure
    .input(z.object({ linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return listNotes(wsId, input?.linkedRecordType, input?.linkedRecordId);
    }),
  create: protectedProcedure
    .input(z.object({ title: z.string().optional(), content: z.string(), linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "create", "notes", 0, input); } catch {}
      return createNote({ ...input, workspaceId: wsId, authorId: ctx.user?.id });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), content: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { id, ...data } = input;
      try { await logAudit(wsId, ctx.user.id, "update", "notes", 0, input); } catch {}
      return updateNote(id, wsId, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireDelete(ctx);
      try { await logAudit(wsId, ctx.user.id, "delete", "notes", 0, null); } catch {}
      return deleteNote(input.id, wsId);
    }),
});

export const capabilityStatementsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const wsId = await getWorkspaceId(ctx);
    return listCapabilityStatements(wsId);
  }),
  create: protectedProcedure
    .input(z.object({ title: z.string(), version: z.string().optional(), content: z.string().optional(), naicsCodes: z.string().optional(), pastPerformance: z.string().optional(), differentiators: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "create", "capabilityStatements", 0, input); } catch {}
      return createCapabilityStatement({ ...input, workspaceId: wsId });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), version: z.string().optional(), content: z.string().optional(), naicsCodes: z.string().optional(), pastPerformance: z.string().optional(), differentiators: z.string().optional(), status: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { id, ...data } = input;
      try { await logAudit(wsId, ctx.user.id, "update", "capabilityStatements", 0, input); } catch {}
      return updateCapabilityStatement(id, wsId, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireDelete(ctx);
      try { await logAudit(wsId, ctx.user.id, "delete", "capabilityStatements", 0, null); } catch {}
      return deleteCapabilityStatement(input.id, wsId);
    }),
});

export const templatesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const wsId = await getWorkspaceId(ctx);
    return listTemplates(wsId);
  }),
  create: protectedProcedure
    .input(z.object({ name: z.string(), category: z.string().optional(), content: z.string().optional(), isDefault: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "create", "templates", 0, input); } catch {}
      return createTemplate({ ...input, workspaceId: wsId });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string().optional(), category: z.string().optional(), content: z.string().optional(), isDefault: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { id, ...data } = input;
      try { await logAudit(wsId, ctx.user.id, "update", "templates", 0, input); } catch {}
      return updateTemplate(id, wsId, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireDelete(ctx);
      try { await logAudit(wsId, ctx.user.id, "delete", "templates", 0, null); } catch {}
      return deleteTemplate(input.id, wsId);
    }),
});

export const closeoutRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const wsId = await getWorkspaceId(ctx);
    return listCloseoutRecords(wsId);
  }),
  create: protectedProcedure
    .input(z.object({ contractId: z.number(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "create", "closeout", 0, input); } catch {}
      return createCloseoutRecord({ ...input, workspaceId: wsId });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), status: z.string().optional(), finalInvoiceSubmitted: z.boolean().optional(), deliverablesComplete: z.boolean().optional(), governmentPropertyReturned: z.boolean().optional(), finalReportSubmitted: z.boolean().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { id, ...data } = input;
      try { await logAudit(wsId, ctx.user.id, "update", "closeout", 0, input); } catch {}
      return updateCloseoutRecord(id, wsId, data);
    }),
});

export const lessonsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const wsId = await getWorkspaceId(ctx);
    return listLessonsLearned(wsId);
  }),
  create: protectedProcedure
    .input(z.object({ contractId: z.number().optional(), proposalId: z.number().optional(), title: z.string(), category: z.string().optional(), description: z.string().optional(), impact: z.string().optional(), recommendation: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "create", "lessons", 0, input); } catch {}
      return createLessonLearned({ ...input, workspaceId: wsId });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireDelete(ctx);
      try { await logAudit(wsId, ctx.user.id, "delete", "lessons", 0, null); } catch {}
      return deleteLessonLearned(input.id, wsId);
    }),
});

export const lossReviewsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const wsId = await getWorkspaceId(ctx);
    return listLossReviews(wsId);
  }),
  create: protectedProcedure
    .input(z.object({ proposalId: z.number(), reviewDate: z.string().optional(), reasonLost: z.string().optional(), competitorInfo: z.string().optional(), lessonsLearned: z.string().optional(), actionItems: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { reviewDate, ...rest } = input;
      try { await logAudit(wsId, ctx.user.id, "create", "lossReviews", 0, input); } catch {}
      return createLossReview({
        ...rest,
        workspaceId: wsId,
        reviewDate: reviewDate ? new Date(reviewDate) : undefined,
      });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), reasonLost: z.string().optional(), competitorInfo: z.string().optional(), lessonsLearned: z.string().optional(), actionItems: z.string().optional(), status: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { id, ...data } = input;
      try { await logAudit(wsId, ctx.user.id, "update", "lossReviews", 0, input); } catch {}
      return updateLossReview(id, wsId, data);
    }),
});

// ==================== FOLLOWUPS ====================
export const followupsRouter = router({
  list: protectedProcedure
    .input(z.object({ contactId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return listFollowups(wsId, input?.contactId);
    }),
  create: protectedProcedure
    .input(z.object({ contactId: z.number(), type: z.string(), notes: z.string().optional(), dueDate: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { dueDate, ...rest } = input;
      try { await logAudit(wsId, ctx.user.id, "create", "followups", 0, input); } catch {}
      return createFollowup({ ...rest, workspaceId: wsId, dueDate: dueDate ? new Date(dueDate) : undefined });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), status: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { id, ...data } = input;
      try { await logAudit(wsId, ctx.user.id, "update", "followups", 0, input); } catch {}
      return updateFollowup(id, wsId, data as any);
    }),
});

// ==================== CLOSEOUT BLOCKERS ====================
export const closeoutBlockersRouter = router({
  list: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return listCloseoutBlockers(wsId, input.contractId);
    }),
  create: protectedProcedure
    .input(z.object({ contractId: z.number(), title: z.string(), description: z.string().optional(), category: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "create", "closeoutBlockers", 0, input); } catch {}
      return createCloseoutBlocker({ ...input, workspaceId: wsId });
    }),
  resolve: protectedProcedure
    .input(z.object({ id: z.number(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "create", "closeoutBlockers", 0, input); } catch {}
      return updateCloseoutBlocker(input.id, wsId, { status: 'resolved', resolvedAt: new Date(), resolvedBy: ctx.user.id, notes: input.notes });
    }),
});

// ==================== CONTRACT REQUIREMENTS ====================
export const contractRequirementsRouter = router({
  list: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return listContractRequirements(wsId, input.contractId);
    }),
  create: protectedProcedure
    .input(z.object({ contractId: z.number(), title: z.string(), description: z.string().optional(), category: z.string().optional(), source: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "create", "contractRequirements", 0, input); } catch {}
      return createContractRequirement({ ...input, workspaceId: wsId });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), status: z.string().optional(), category: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { id, ...data } = input;
      try { await logAudit(wsId, ctx.user.id, "update", "contractRequirements", 0, input); } catch {}
      return updateContractRequirement(id, wsId, data);
    }),
});

// ==================== CONTACT LINKS ====================
export const contactLinksRouter = router({
  list: protectedProcedure
    .input(z.object({ linkedRecordType: z.string(), linkedRecordId: z.number() }))
    .query(async ({ input }) => {
      return getContactLinksForRecord(input.linkedRecordType, input.linkedRecordId);
    }),
  create: protectedProcedure
    .input(z.object({ contactId: z.number(), linkedRecordType: z.string(), linkedRecordId: z.number(), role: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "create", "contactLinks", 0, input); } catch {}
      return createContactLink(input);
    }),
});

// ==================== FINANCE NOTES ====================
export const financeNotesRouter = router({
  list: protectedProcedure
    .input(z.object({ recordType: z.string(), recordId: z.number() }))
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return listFinanceNotes(wsId, input.recordType, input.recordId);
    }),
  create: protectedProcedure
    .input(z.object({ recordType: z.string(), recordId: z.number(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "create", "financeNotes", 0, input); } catch {}
      return createFinanceNote({ workspaceId: wsId, recordType: input.recordType, recordId: input.recordId, content: input.content, authorId: ctx.user.id });
    }),
});

// ==================== FILE VERSIONS ====================
export const fileVersionsRouter = router({
  listAll: protectedProcedure
    .query(async ({ ctx }) => {
      const wsId = await getWorkspaceId(ctx);
      return listAllFileVersionsForWorkspace(wsId);
    }),
  list: protectedProcedure
    .input(z.object({ fileId: z.number() }))
    .query(async ({ input }) => {
      return listFileVersions(input.fileId);
    }),
  create: protectedProcedure
    .input(z.object({ fileId: z.number(), versionNumber: z.number(), storageKey: z.string(), storageUrl: z.string(), size: z.number().optional(), mimeType: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      try { await logAudit(wsId, ctx.user.id, "create", "fileVersions", 0, input); } catch {}
      return createFileVersion({ ...input, workspaceId: wsId, uploadedBy: ctx.user.id });
    }),
});

// ==================== PROPOSAL FRAMEWORKS ====================
import { listProposalFrameworks, getProposalFramework, listProposalSections, createProposalSection, updateProposalSection, deleteProposalSection } from "./entityDb";

export const proposalFrameworksRouter = router({
  list: protectedProcedure.query(async () => {
    return listProposalFrameworks();
  }),
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getProposalFramework(input.id);
    }),
});

// ==================== PROPOSAL SECTIONS ====================
export const proposalSectionsRouter = router({
  list: protectedProcedure
    .input(z.object({ proposalId: z.number() }))
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return listProposalSections(wsId, input.proposalId);
    }),
  create: protectedProcedure
    .input(z.object({ proposalId: z.number(), title: z.string(), content: z.string().optional(), sortOrder: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const id = await createProposalSection({ ...input, workspaceId: wsId });
      try { await logAudit(wsId, ctx.user.id, "create", "proposalSections", 0, input); } catch {}
      return { id };
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), content: z.string().optional(), status: z.string().optional(), isAiDraft: z.boolean().optional(), sortOrder: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWrite(ctx);
      const { id, ...data } = input;
      await updateProposalSection(id, wsId, data);
      try { await logAudit(wsId, ctx.user.id, "update", "proposalSections", 0, input); } catch {}
      return { success: true };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireDelete(ctx);
      await deleteProposalSection(input.id, wsId);
      try { await logAudit(wsId, ctx.user.id, "delete", "proposalSections", input.id, null); } catch {}
      return { success: true };
    }),
  aiDraft: protectedProcedure
    .input(z.object({ sectionId: z.number(), proposalId: z.number(), sectionTitle: z.string(), proposalTitle: z.string(), framework: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireDelete(ctx);
      const { invokeLLM } = await import("./_core/llm");
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a government contracting proposal writer. Generate professional, detailed content for the specified proposal section. Use clear, formal language appropriate for government submissions. Include relevant details and structure the content with clear paragraphs." },
          { role: "user", content: `Generate draft content for the "${input.sectionTitle}" section of a government contracting proposal titled "${input.proposalTitle}". Framework type: ${input.framework || "standard"}. Write 3-5 paragraphs of professional proposal content.` },
        ],
      });
      const content = response.choices?.[0]?.message?.content || "Unable to generate draft content.";
      await updateProposalSection(input.sectionId, wsId, { content, isAiDraft: true, status: "needs_review" });
      try { await logAudit(wsId, ctx.user.id, "delete", "proposalSections", 0, null); } catch {}
      return { content };
    }),
});

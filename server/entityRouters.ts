import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  listFiles, createFile, deleteFile,
  listContacts, createContact, updateContact, deleteContact,
  listMessages, createMessage, deleteMessage,
  listInvoices, createInvoice, updateInvoice, deleteInvoice,
  listPayments, createPayment, deletePayment,
  listTasks, createTask, updateTask, deleteTask,
  listAlerts, createAlert, dismissAlert,
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
} from "./entityDb";

// Helper: get workspace ID from user context (default to 1 for now)
function getWorkspaceId(ctx: any): number {
  return ctx.user?.workspaceId || 1;
}

export const filesRouter = router({
  list: publicProcedure
    .input(z.object({ linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return listFiles(wsId, input?.linkedRecordType, input?.linkedRecordId);
    }),
  create: publicProcedure
    .input(z.object({ name: z.string(), fileKey: z.string(), url: z.string(), mimeType: z.string().optional(), size: z.number().optional(), linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional(), category: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return createFile({ ...input, workspaceId: wsId, uploadedBy: ctx.user?.id });
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return deleteFile(input.id, wsId);
    }),
});

export const contactsRouter = router({
  list: publicProcedure
    .input(z.object({ linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return listContacts(wsId, input?.linkedRecordType, input?.linkedRecordId);
    }),
  create: publicProcedure
    .input(z.object({ firstName: z.string(), lastName: z.string(), email: z.string().optional(), phone: z.string().optional(), organization: z.string().optional(), title: z.string().optional(), role: z.string().optional(), linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return createContact({ ...input, workspaceId: wsId });
    }),
  update: publicProcedure
    .input(z.object({ id: z.number(), firstName: z.string().optional(), lastName: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), organization: z.string().optional(), title: z.string().optional(), role: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateContact(id, wsId, data);
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return deleteContact(input.id, wsId);
    }),
});

export const messagesRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const wsId = getWorkspaceId(ctx);
    return listMessages(wsId);
  }),
  create: publicProcedure
    .input(z.object({ subject: z.string(), body: z.string(), recipientId: z.number().optional(), linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return createMessage({ ...input, workspaceId: wsId, senderId: ctx.user?.id || 0 });
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return deleteMessage(input.id, wsId);
    }),
});

export const invoicesRouter = router({
  list: publicProcedure
    .input(z.object({ contractId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return listInvoices(wsId, input?.contractId);
    }),
  create: publicProcedure
    .input(z.object({ contractId: z.number().optional(), invoiceNumber: z.string(), amount: z.string(), status: z.string().optional(), issuedDate: z.string().optional(), dueDate: z.string().optional(), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      const { issuedDate, dueDate, ...rest } = input;
      return createInvoice({
        ...rest,
        workspaceId: wsId,
        issuedDate: issuedDate ? new Date(issuedDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
    }),
  update: publicProcedure
    .input(z.object({ id: z.number(), invoiceNumber: z.string().optional(), amount: z.string().optional(), status: z.string().optional(), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateInvoice(id, wsId, data);
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return deleteInvoice(input.id, wsId);
    }),
});

export const paymentsRouter = router({
  list: publicProcedure
    .input(z.object({ contractId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return listPayments(wsId, input?.contractId);
    }),
  create: publicProcedure
    .input(z.object({ invoiceId: z.number().optional(), contractId: z.number().optional(), amount: z.string(), paymentDate: z.string().optional(), method: z.string().optional(), reference: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      const { paymentDate, ...rest } = input;
      return createPayment({
        ...rest,
        workspaceId: wsId,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
      });
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return deletePayment(input.id, wsId);
    }),
});

export const tasksRouter = router({
  list: publicProcedure
    .input(z.object({ linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return listTasks(wsId, input?.linkedRecordType, input?.linkedRecordId);
    }),
  create: publicProcedure
    .input(z.object({ title: z.string(), description: z.string().optional(), assignedTo: z.number().optional(), linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional(), priority: z.string().optional(), dueDate: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      const { dueDate, ...rest } = input;
      return createTask({
        ...rest,
        workspaceId: wsId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
    }),
  update: publicProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), status: z.string().optional(), priority: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateTask(id, wsId, data);
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return deleteTask(input.id, wsId);
    }),
});

export const alertsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const wsId = getWorkspaceId(ctx);
    return listAlerts(wsId);
  }),
  create: publicProcedure
    .input(z.object({ title: z.string(), message: z.string().optional(), type: z.string().optional(), linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return createAlert({ ...input, workspaceId: wsId });
    }),
  dismiss: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return dismissAlert(input.id, wsId);
    }),
});

export const deliverablesRouter = router({
  list: publicProcedure
    .input(z.object({ contractId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return listDeliverables(wsId, input?.contractId);
    }),
  create: publicProcedure
    .input(z.object({ contractId: z.number(), title: z.string(), description: z.string().optional(), dueDate: z.string().optional(), status: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      const { dueDate, ...rest } = input;
      return createDeliverable({
        ...rest,
        workspaceId: wsId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
    }),
  update: publicProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), status: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateDeliverable(id, wsId, data);
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return deleteDeliverable(input.id, wsId);
    }),
});

export const deadlinesRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const wsId = getWorkspaceId(ctx);
    return listDeadlines(wsId);
  }),
  create: publicProcedure
    .input(z.object({ title: z.string(), description: z.string().optional(), dueDate: z.string(), linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional(), priority: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      const { dueDate, ...rest } = input;
      return createDeadline({
        ...rest,
        workspaceId: wsId,
        dueDate: new Date(dueDate),
      });
    }),
  update: publicProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), priority: z.string().optional(), status: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateDeadline(id, wsId, data);
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return deleteDeadline(input.id, wsId);
    }),
});

export const obligationsRouter = router({
  list: publicProcedure
    .input(z.object({ contractId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return listObligations(wsId, input?.contractId);
    }),
  create: publicProcedure
    .input(z.object({ contractId: z.number(), title: z.string(), description: z.string().optional(), obligationType: z.string().optional(), frequency: z.string().optional(), dueDate: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      const { dueDate, ...rest } = input;
      return createObligation({
        ...rest,
        workspaceId: wsId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
    }),
  update: publicProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), status: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateObligation(id, wsId, data);
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return deleteObligation(input.id, wsId);
    }),
});

export const complianceRouter = router({
  list: publicProcedure
    .input(z.object({ contractId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return listComplianceItems(wsId, input?.contractId);
    }),
  create: publicProcedure
    .input(z.object({ contractId: z.number().optional(), title: z.string(), description: z.string().optional(), regulation: z.string().optional(), category: z.string().optional(), dueDate: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      const { dueDate, ...rest } = input;
      return createComplianceItem({
        ...rest,
        workspaceId: wsId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
    }),
  update: publicProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), regulation: z.string().optional(), category: z.string().optional(), status: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateComplianceItem(id, wsId, data);
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return deleteComplianceItem(input.id, wsId);
    }),
});

export const notesRouter = router({
  list: publicProcedure
    .input(z.object({ linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return listNotes(wsId, input?.linkedRecordType, input?.linkedRecordId);
    }),
  create: publicProcedure
    .input(z.object({ title: z.string().optional(), content: z.string(), linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return createNote({ ...input, workspaceId: wsId, authorId: ctx.user?.id });
    }),
  update: publicProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), content: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateNote(id, wsId, data);
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return deleteNote(input.id, wsId);
    }),
});

export const capabilityStatementsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const wsId = getWorkspaceId(ctx);
    return listCapabilityStatements(wsId);
  }),
  create: publicProcedure
    .input(z.object({ title: z.string(), version: z.string().optional(), content: z.string().optional(), naicsCodes: z.string().optional(), pastPerformance: z.string().optional(), differentiators: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return createCapabilityStatement({ ...input, workspaceId: wsId });
    }),
  update: publicProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), version: z.string().optional(), content: z.string().optional(), naicsCodes: z.string().optional(), pastPerformance: z.string().optional(), differentiators: z.string().optional(), status: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateCapabilityStatement(id, wsId, data);
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return deleteCapabilityStatement(input.id, wsId);
    }),
});

export const templatesRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const wsId = getWorkspaceId(ctx);
    return listTemplates(wsId);
  }),
  create: publicProcedure
    .input(z.object({ name: z.string(), category: z.string().optional(), content: z.string().optional(), isDefault: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return createTemplate({ ...input, workspaceId: wsId });
    }),
  update: publicProcedure
    .input(z.object({ id: z.number(), name: z.string().optional(), category: z.string().optional(), content: z.string().optional(), isDefault: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateTemplate(id, wsId, data);
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return deleteTemplate(input.id, wsId);
    }),
});

export const closeoutRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const wsId = getWorkspaceId(ctx);
    return listCloseoutRecords(wsId);
  }),
  create: publicProcedure
    .input(z.object({ contractId: z.number(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return createCloseoutRecord({ ...input, workspaceId: wsId });
    }),
  update: publicProcedure
    .input(z.object({ id: z.number(), status: z.string().optional(), finalInvoiceSubmitted: z.boolean().optional(), deliverablesComplete: z.boolean().optional(), governmentPropertyReturned: z.boolean().optional(), finalReportSubmitted: z.boolean().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateCloseoutRecord(id, wsId, data);
    }),
});

export const lessonsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const wsId = getWorkspaceId(ctx);
    return listLessonsLearned(wsId);
  }),
  create: publicProcedure
    .input(z.object({ contractId: z.number().optional(), proposalId: z.number().optional(), title: z.string(), category: z.string().optional(), description: z.string().optional(), impact: z.string().optional(), recommendation: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return createLessonLearned({ ...input, workspaceId: wsId });
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      return deleteLessonLearned(input.id, wsId);
    }),
});

export const lossReviewsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const wsId = getWorkspaceId(ctx);
    return listLossReviews(wsId);
  }),
  create: publicProcedure
    .input(z.object({ proposalId: z.number(), reviewDate: z.string().optional(), reasonLost: z.string().optional(), competitorInfo: z.string().optional(), lessonsLearned: z.string().optional(), actionItems: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      const { reviewDate, ...rest } = input;
      return createLossReview({
        ...rest,
        workspaceId: wsId,
        reviewDate: reviewDate ? new Date(reviewDate) : undefined,
      });
    }),
  update: publicProcedure
    .input(z.object({ id: z.number(), reasonLost: z.string().optional(), competitorInfo: z.string().optional(), lessonsLearned: z.string().optional(), actionItems: z.string().optional(), status: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateLossReview(id, wsId, data);
    }),
});

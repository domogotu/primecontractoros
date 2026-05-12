import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { sendInvoiceAlert, sendDeadlineReminder } from "./services/email";
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

// Helper: get workspace ID from user context (resolves from DB)
async function getWorkspaceId(ctx: any): Promise<number> {
  if (!ctx.user?.id) throw new Error("Not authenticated");
  return requireWorkspaceId(ctx.user.id);
}

export const filesRouter = router({
  list: protectedProcedure
    .input(z.object({ linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return listFiles(wsId, input?.linkedRecordType, input?.linkedRecordId);
    }),
  create: protectedProcedure
    .input(z.object({ name: z.string(), fileKey: z.string(), url: z.string(), mimeType: z.string().optional(), size: z.number().optional(), linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional(), category: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return createFile({ ...input, workspaceId: wsId, uploadedBy: ctx.user?.id });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
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
  create: protectedProcedure
    .input(z.object({ firstName: z.string(), lastName: z.string(), email: z.string().optional(), phone: z.string().optional(), organization: z.string().optional(), title: z.string().optional(), role: z.string().optional(), linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return createContact({ ...input, workspaceId: wsId });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), firstName: z.string().optional(), lastName: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), organization: z.string().optional(), title: z.string().optional(), role: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateContact(id, wsId, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
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
      const wsId = await getWorkspaceId(ctx);
      return createMessage({ ...input, workspaceId: wsId, senderId: ctx.user?.id || 0 });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
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
  create: protectedProcedure
    .input(z.object({ contractId: z.number().optional(), invoiceNumber: z.string(), amount: z.string(), status: z.string().optional(), issuedDate: z.string().optional(), dueDate: z.string().optional(), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
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
      return result;
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), invoiceNumber: z.string().optional(), amount: z.string().optional(), status: z.string().optional(), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateInvoice(id, wsId, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return deleteInvoice(input.id, wsId);
    }),
});

export const paymentsRouter = router({
  list: protectedProcedure
    .input(z.object({ contractId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return listPayments(wsId, input?.contractId);
    }),
  create: protectedProcedure
    .input(z.object({ invoiceId: z.number().optional(), contractId: z.number().optional(), amount: z.string(), paymentDate: z.string().optional(), method: z.string().optional(), reference: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      const { paymentDate, ...rest } = input;
      return createPayment({
        ...rest,
        workspaceId: wsId,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return deletePayment(input.id, wsId);
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
      const wsId = await getWorkspaceId(ctx);
      const { dueDate, ...rest } = input;
      return createTask({
        ...rest,
        workspaceId: wsId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), status: z.string().optional(), priority: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateTask(id, wsId, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
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
      const wsId = await getWorkspaceId(ctx);
      return createAlert({ ...input, workspaceId: wsId });
    }),
  dismiss: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return dismissAlert(input.id, wsId);
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
      const wsId = await getWorkspaceId(ctx);
      const { dueDate, ...rest } = input;
      return createDeliverable({
        ...rest,
        workspaceId: wsId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), status: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateDeliverable(id, wsId, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      return deleteDeliverable(input.id, wsId);
    }),
});

export const deadlinesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const wsId = await getWorkspaceId(ctx);
    return listDeadlines(wsId);
  }),
  create: protectedProcedure
    .input(z.object({ title: z.string(), description: z.string().optional(), dueDate: z.string(), linkedRecordType: z.string().optional(), linkedRecordId: z.number().optional(), priority: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
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
      return result;
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), priority: z.string().optional(), status: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateDeadline(id, wsId, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
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
      const wsId = await getWorkspaceId(ctx);
      const { dueDate, ...rest } = input;
      return createObligation({
        ...rest,
        workspaceId: wsId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), status: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateObligation(id, wsId, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
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
      const wsId = await getWorkspaceId(ctx);
      const { dueDate, ...rest } = input;
      return createComplianceItem({
        ...rest,
        workspaceId: wsId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), regulation: z.string().optional(), category: z.string().optional(), status: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateComplianceItem(id, wsId, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
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
      const wsId = await getWorkspaceId(ctx);
      return createNote({ ...input, workspaceId: wsId, authorId: ctx.user?.id });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), content: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateNote(id, wsId, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
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
      const wsId = await getWorkspaceId(ctx);
      return createCapabilityStatement({ ...input, workspaceId: wsId });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), version: z.string().optional(), content: z.string().optional(), naicsCodes: z.string().optional(), pastPerformance: z.string().optional(), differentiators: z.string().optional(), status: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateCapabilityStatement(id, wsId, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
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
      const wsId = await getWorkspaceId(ctx);
      return createTemplate({ ...input, workspaceId: wsId });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string().optional(), category: z.string().optional(), content: z.string().optional(), isDefault: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateTemplate(id, wsId, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
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
      const wsId = await getWorkspaceId(ctx);
      return createCloseoutRecord({ ...input, workspaceId: wsId });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), status: z.string().optional(), finalInvoiceSubmitted: z.boolean().optional(), deliverablesComplete: z.boolean().optional(), governmentPropertyReturned: z.boolean().optional(), finalReportSubmitted: z.boolean().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      const { id, ...data } = input;
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
      const wsId = await getWorkspaceId(ctx);
      return createLessonLearned({ ...input, workspaceId: wsId });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
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
      const wsId = await getWorkspaceId(ctx);
      const { reviewDate, ...rest } = input;
      return createLossReview({
        ...rest,
        workspaceId: wsId,
        reviewDate: reviewDate ? new Date(reviewDate) : undefined,
      });
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), reasonLost: z.string().optional(), competitorInfo: z.string().optional(), lessonsLearned: z.string().optional(), actionItems: z.string().optional(), status: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await getWorkspaceId(ctx);
      const { id, ...data } = input;
      return updateLossReview(id, wsId, data);
    }),
});

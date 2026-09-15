import { and, eq, desc, like } from "drizzle-orm";
import { getDb, getInsertId } from "./db";
import {
  files, contacts, messages, invoices, payments, tasks, alerts,
  capabilityStatements, templates, closeoutRecords, lessonsLearned,
  lossReviews, deliverables, deadlines, obligations, complianceItems, notes
} from "../drizzle/schema";
// ==================== FILES ====================
export async function listFiles(workspaceId: number, linkedRecordType?: string, linkedRecordId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(files.workspaceId, workspaceId)];
  if (linkedRecordType) conditions.push(eq(files.linkedRecordType, linkedRecordType));
  if (linkedRecordId) conditions.push(eq(files.linkedRecordId, linkedRecordId));
  return db.select().from(files).where(and(...conditions)).orderBy(desc(files.createdAt));
}

export async function createFile(data: { workspaceId: number; name: string; fileKey: string; url: string; mimeType?: string; size?: number; linkedRecordType?: string; linkedRecordId?: number; category?: string; uploadedBy?: number; versionNumber?: number; isGoverningDocument?: boolean; documentDate?: Date | null; notes?: string; storageProvider?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(files).values(data as any);
  return { id: getInsertId(result) };
}

export async function updateFile(id: number, workspaceId: number, data: Partial<{ name: string; category: string; linkedRecordType: string | null; linkedRecordId: number | null; isGoverningDocument: boolean; documentDate: Date | null; notes: string | null; versionNumber: number }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(files).set(data as any).where(and(eq(files.id, id), eq(files.workspaceId, workspaceId)));
  return { success: true };
}

export async function deleteFile(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(files).where(and(eq(files.id, id), eq(files.workspaceId, workspaceId)));
}

export async function getFileById(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(files).where(and(eq(files.id, id), eq(files.workspaceId, workspaceId))).limit(1);
  return row || null;
}

// ==================== CONTACTS ====================
export async function listContacts(workspaceId: number, linkedRecordType?: string, linkedRecordId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(contacts.workspaceId, workspaceId)];
  if (linkedRecordType) conditions.push(eq(contacts.linkedRecordType, linkedRecordType));
  if (linkedRecordId) conditions.push(eq(contacts.linkedRecordId, linkedRecordId));
  return db.select().from(contacts).where(and(...conditions)).orderBy(desc(contacts.createdAt));
}

export async function createContact(data: { workspaceId: number; firstName: string; lastName: string; email?: string; phone?: string; organization?: string; title?: string; role?: string; linkedRecordType?: string; linkedRecordId?: number; notes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contacts).values(data as any);
  return { id: getInsertId(result) };
}

export async function updateContact(id: number, workspaceId: number, data: Partial<{ firstName: string; lastName: string; email: string; phone: string; organization: string; title: string; role: string; notes: string }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contacts).set(data as any).where(and(eq(contacts.id, id), eq(contacts.workspaceId, workspaceId)));
}

export async function deleteContact(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contacts).where(and(eq(contacts.id, id), eq(contacts.workspaceId, workspaceId)));
}

export async function getContactById(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(contacts).where(and(eq(contacts.id, id), eq(contacts.workspaceId, workspaceId))).limit(1);
  return row || null;
}

// ==================== MESSAGES ====================
export async function listMessages(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(eq(messages.workspaceId, workspaceId)).orderBy(desc(messages.createdAt));
}

export async function createMessage(data: { workspaceId: number; subject: string; body: string; senderId: number; recipientId?: number; linkedRecordType?: string; linkedRecordId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(messages).values(data as any);
  return { id: getInsertId(result) };
}

export async function deleteMessage(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(messages).where(and(eq(messages.id, id), eq(messages.workspaceId, workspaceId)));
}

// ==================== INVOICES ====================
export async function listInvoices(workspaceId: number, contractId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(invoices.workspaceId, workspaceId)];
  if (contractId) conditions.push(eq(invoices.contractId, contractId));
  return db.select().from(invoices).where(and(...conditions)).orderBy(desc(invoices.createdAt));
}

export async function createInvoice(data: { workspaceId: number; contractId?: number; invoiceNumber: string; amount: string; status?: string; issuedDate?: Date; dueDate?: Date; description?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(invoices).values(data as any);
  return { id: getInsertId(result) };
}

export async function updateInvoice(id: number, workspaceId: number, data: Partial<{ invoiceNumber: string; amount: string; status: string; issuedDate: Date; dueDate: Date; paidDate: Date; description: string }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(invoices).set(data as any).where(and(eq(invoices.id, id), eq(invoices.workspaceId, workspaceId)));
}

export async function deleteInvoice(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(invoices).where(and(eq(invoices.id, id), eq(invoices.workspaceId, workspaceId)));
}

export async function getInvoiceById(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(invoices).where(and(eq(invoices.id, id), eq(invoices.workspaceId, workspaceId))).limit(1);
  return row || null;
}

// ==================== PAYMENTS ====================
export async function listPayments(workspaceId: number, contractId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(payments.workspaceId, workspaceId)];
  if (contractId) conditions.push(eq(payments.contractId, contractId));
  return db.select().from(payments).where(and(...conditions)).orderBy(desc(payments.createdAt));
}

export async function createPayment(data: { workspaceId: number; invoiceId?: number; contractId?: number; amount: string; paymentDate?: Date; method?: string; reference?: string; notes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(payments).values(data as any);
  return { id: getInsertId(result) };
}

export async function deletePayment(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(payments).where(and(eq(payments.id, id), eq(payments.workspaceId, workspaceId)));
}

export async function getPaymentById(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(payments).where(and(eq(payments.id, id), eq(payments.workspaceId, workspaceId))).limit(1);
  return row || null;
}

// ==================== TASKS ====================
export async function listTasks(workspaceId: number, linkedRecordType?: string, linkedRecordId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(tasks.workspaceId, workspaceId)];
  if (linkedRecordType) conditions.push(eq(tasks.linkedRecordType, linkedRecordType));
  if (linkedRecordId) conditions.push(eq(tasks.linkedRecordId, linkedRecordId));
  return db.select().from(tasks).where(and(...conditions)).orderBy(desc(tasks.createdAt));
}

export async function createTask(data: { workspaceId: number; title: string; description?: string; assignedTo?: number; linkedRecordType?: string; linkedRecordId?: number; priority?: string; dueDate?: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tasks).values(data as any);
  return { id: getInsertId(result) };
}

export async function updateTask(id: number, workspaceId: number, data: Partial<{ title: string; description: string; status: string; priority: string; dueDate: Date; completedAt: Date }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tasks).set(data as any).where(and(eq(tasks.id, id), eq(tasks.workspaceId, workspaceId)));
}

export async function deleteTask(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.workspaceId, workspaceId)));
}

// ==================== ALERTS ====================
export async function listAlerts(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(alerts).where(and(eq(alerts.workspaceId, workspaceId), eq(alerts.isDismissed, false))).orderBy(desc(alerts.createdAt));
}

export async function createAlert(data: { workspaceId: number; title: string; message?: string; type?: string; linkedRecordType?: string; linkedRecordId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(alerts).values(data as any);
  return { id: getInsertId(result) };
}

export async function dismissAlert(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(alerts).set({ isDismissed: true }).where(and(eq(alerts.id, id), eq(alerts.workspaceId, workspaceId)));
}

export async function markAlertRead(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) return null;
  await db.update(alerts).set({ isRead: true }).where(and(eq(alerts.id, id), eq(alerts.workspaceId, workspaceId)));
  return { success: true };
}

export async function markAllAlertsRead(workspaceId: number) {
  const db = await getDb();
  if (!db) return null;
  await db.update(alerts).set({ isRead: true }).where(eq(alerts.workspaceId, workspaceId));
  return { success: true };
}

// ==================== DELIVERABLES ====================
export async function listDeliverables(workspaceId: number, contractId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(deliverables.workspaceId, workspaceId)];
  if (contractId) conditions.push(eq(deliverables.contractId, contractId));
  return db.select().from(deliverables).where(and(...conditions)).orderBy(desc(deliverables.createdAt));
}

export async function createDeliverable(data: { workspaceId: number; contractId: number; title: string; description?: string; dueDate?: Date; status?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(deliverables).values(data as any);
  return { id: getInsertId(result) };
}

export async function updateDeliverable(id: number, workspaceId: number, data: Partial<{ title: string; description: string; status: string; dueDate: Date; submittedAt: Date; acceptedAt: Date }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(deliverables).set(data as any).where(and(eq(deliverables.id, id), eq(deliverables.workspaceId, workspaceId)));
}

export async function deleteDeliverable(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(deliverables).where(and(eq(deliverables.id, id), eq(deliverables.workspaceId, workspaceId)));
}

// ==================== DEADLINES ====================
export async function listDeadlines(workspaceId: number, contractId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(deadlines.workspaceId, workspaceId)];
  if (contractId) conditions.push(eq(deadlines.linkedRecordId, contractId));
  // When contractId is provided, also filter by linkedRecordType = 'contract'
  if (contractId) conditions.push(eq(deadlines.linkedRecordType, "contract"));
  return db.select().from(deadlines).where(and(...conditions)).orderBy(desc(deadlines.dueDate));
}

export async function createDeadline(data: { workspaceId: number; title: string; description?: string; dueDate: Date; linkedRecordType?: string; linkedRecordId?: number; priority?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(deadlines).values(data as any);
  return { id: getInsertId(result) };
}

export async function updateDeadline(id: number, workspaceId: number, data: Partial<{ title: string; description: string; dueDate: Date; priority: string; status: string; completedAt: Date }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(deadlines).set(data as any).where(and(eq(deadlines.id, id), eq(deadlines.workspaceId, workspaceId)));
}

export async function deleteDeadline(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(deadlines).where(and(eq(deadlines.id, id), eq(deadlines.workspaceId, workspaceId)));
}

// ==================== OBLIGATIONS ====================
export async function listObligations(workspaceId: number, contractId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(obligations.workspaceId, workspaceId)];
  if (contractId) conditions.push(eq(obligations.contractId, contractId));
  return db.select().from(obligations).where(and(...conditions)).orderBy(desc(obligations.createdAt));
}

export async function createObligation(data: { workspaceId: number; contractId: number; title: string; description?: string; obligationType?: string; frequency?: string; dueDate?: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(obligations).values(data as any);
  return { id: getInsertId(result) };
}

export async function updateObligation(id: number, workspaceId: number, data: Partial<{ title: string; description: string; status: string; dueDate: Date; completedAt: Date }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(obligations).set(data as any).where(and(eq(obligations.id, id), eq(obligations.workspaceId, workspaceId)));
}

export async function deleteObligation(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(obligations).where(and(eq(obligations.id, id), eq(obligations.workspaceId, workspaceId)));
}

// ==================== COMPLIANCE ITEMS ====================
export async function listComplianceItems(workspaceId: number, contractId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(complianceItems.workspaceId, workspaceId)];
  if (contractId) conditions.push(eq(complianceItems.contractId, contractId));
  return db.select().from(complianceItems).where(and(...conditions)).orderBy(desc(complianceItems.createdAt));
}

export async function createComplianceItem(data: { workspaceId: number; contractId?: number; title: string; description?: string; regulation?: string; category?: string; dueDate?: Date; notes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(complianceItems).values(data as any);
  return { id: getInsertId(result) };
}

export async function updateComplianceItem(id: number, workspaceId: number, data: Partial<{ title: string; description: string; regulation: string; category: string; status: string; dueDate: Date; lastReviewDate: Date; notes: string }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(complianceItems).set(data as any).where(and(eq(complianceItems.id, id), eq(complianceItems.workspaceId, workspaceId)));
}

export async function deleteComplianceItem(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(complianceItems).where(and(eq(complianceItems.id, id), eq(complianceItems.workspaceId, workspaceId)));
}

// ==================== NOTES ====================
export async function listNotes(workspaceId: number, linkedRecordType?: string, linkedRecordId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(notes.workspaceId, workspaceId)];
  if (linkedRecordType) conditions.push(eq(notes.linkedRecordType, linkedRecordType));
  if (linkedRecordId) conditions.push(eq(notes.linkedRecordId, linkedRecordId));
  return db.select().from(notes).where(and(...conditions)).orderBy(desc(notes.createdAt));
}

export async function createNote(data: { workspaceId: number; title?: string; content: string; linkedRecordType?: string; linkedRecordId?: number; authorId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notes).values(data as any);
  return { id: getInsertId(result) };
}

export async function updateNote(id: number, workspaceId: number, data: Partial<{ title: string; content: string }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notes).set(data as any).where(and(eq(notes.id, id), eq(notes.workspaceId, workspaceId)));
}

export async function deleteNote(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(notes).where(and(eq(notes.id, id), eq(notes.workspaceId, workspaceId)));
}

// ==================== CAPABILITY STATEMENTS ====================
export async function listCapabilityStatements(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(capabilityStatements).where(eq(capabilityStatements.workspaceId, workspaceId)).orderBy(desc(capabilityStatements.createdAt));
}

export async function createCapabilityStatement(data: { workspaceId: number; title: string; version?: string; content?: string; naicsCodes?: string; pastPerformance?: string; differentiators?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(capabilityStatements).values(data as any);
  return { id: getInsertId(result) };
}

export async function updateCapabilityStatement(id: number, workspaceId: number, data: Partial<{ title: string; version: string; content: string; naicsCodes: string; pastPerformance: string; differentiators: string; status: string }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(capabilityStatements).set(data as any).where(and(eq(capabilityStatements.id, id), eq(capabilityStatements.workspaceId, workspaceId)));
}

export async function deleteCapabilityStatement(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(capabilityStatements).where(and(eq(capabilityStatements.id, id), eq(capabilityStatements.workspaceId, workspaceId)));
}

// ==================== TEMPLATES ====================
export async function listTemplates(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(templates).where(eq(templates.workspaceId, workspaceId)).orderBy(desc(templates.createdAt));
}

export async function createTemplate(data: { workspaceId: number; name: string; category?: string; content?: string; isDefault?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(templates).values(data as any);
  return { id: getInsertId(result) };
}

export async function updateTemplate(id: number, workspaceId: number, data: Partial<{ name: string; category: string; content: string; isDefault: boolean }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(templates).set(data as any).where(and(eq(templates.id, id), eq(templates.workspaceId, workspaceId)));
}

export async function deleteTemplate(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(templates).where(and(eq(templates.id, id), eq(templates.workspaceId, workspaceId)));
}

// ==================== CLOSEOUT RECORDS ====================
export async function listCloseoutRecords(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(closeoutRecords).where(eq(closeoutRecords.workspaceId, workspaceId)).orderBy(desc(closeoutRecords.createdAt));
}

export async function createCloseoutRecord(data: { workspaceId: number; contractId: number; notes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(closeoutRecords).values(data as any);
  return { id: getInsertId(result) };
}

export async function updateCloseoutRecord(id: number, workspaceId: number, data: Partial<{ status: string; finalInvoiceSubmitted: boolean; deliverablesComplete: boolean; governmentPropertyReturned: boolean; finalReportSubmitted: boolean; notes: string; completedAt: Date }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(closeoutRecords).set(data as any).where(and(eq(closeoutRecords.id, id), eq(closeoutRecords.workspaceId, workspaceId)));
}

// ==================== LESSONS LEARNED ====================
export async function listLessonsLearned(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lessonsLearned).where(eq(lessonsLearned.workspaceId, workspaceId)).orderBy(desc(lessonsLearned.createdAt));
}

export async function createLessonLearned(data: { workspaceId: number; contractId?: number; proposalId?: number; title: string; category?: string; description?: string; impact?: string; recommendation?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(lessonsLearned).values(data as any);
  return { id: getInsertId(result) };
}

export async function deleteLessonLearned(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(lessonsLearned).where(and(eq(lessonsLearned.id, id), eq(lessonsLearned.workspaceId, workspaceId)));
}

// ==================== LOSS REVIEWS ====================
export async function listLossReviews(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lossReviews).where(eq(lossReviews.workspaceId, workspaceId)).orderBy(desc(lossReviews.createdAt));
}

export async function createLossReview(data: { workspaceId: number; proposalId: number; reviewDate?: Date; reasonLost?: string; competitorInfo?: string; lessonsLearned?: string; actionItems?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(lossReviews).values(data as any);
  return { id: getInsertId(result) };
}

export async function updateLossReview(id: number, workspaceId: number, data: Partial<{ reasonLost: string; competitorInfo: string; lessonsLearned: string; actionItems: string; status: string }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(lossReviews).set(data as any).where(and(eq(lossReviews.id, id), eq(lossReviews.workspaceId, workspaceId)));
}

// ==================== INVOICE-PAYMENT LINKS ====================
export async function linkPaymentToInvoice(data: { invoiceId: number; paymentId: number; amount: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { invoicePaymentLinks } = await import("../drizzle/schema");
  const result = await db.insert(invoicePaymentLinks).values({ ...data, createdAt: new Date() } as any);
  return { id: getInsertId(result) };
}

export async function getPaymentLinksForInvoice(invoiceId: number) {
  const db = await getDb();
  if (!db) return [];
  const { invoicePaymentLinks } = await import("../drizzle/schema");
  return db.select().from(invoicePaymentLinks).where(eq(invoicePaymentLinks.invoiceId, invoiceId));
}

// ==================== INVOICE STATUS HISTORY ====================
export async function addInvoiceStatusHistory(data: { invoiceId: number; oldStatus: string; newStatus: string; changedBy?: number; notes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { invoiceStatusHistory } = await import("../drizzle/schema");
  const result = await db.insert(invoiceStatusHistory).values({ ...data, changedAt: new Date() } as any);
  return { id: getInsertId(result) };
}

export async function getInvoiceStatusHistory(invoiceId: number) {
  const db = await getDb();
  if (!db) return [];
  const { invoiceStatusHistory } = await import("../drizzle/schema");
  return db.select().from(invoiceStatusHistory).where(eq(invoiceStatusHistory.invoiceId, invoiceId)).orderBy(invoiceStatusHistory.createdAt);
}

// ==================== CONTACT LINKS ====================
export async function createContactLink(data: { workspaceId: number; contactId: number; recordType: string; recordId: number; role?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { contactLinks } = await import("../drizzle/schema");
  const result = await db.insert(contactLinks).values({ ...data, createdAt: new Date() } as any);
  return { id: getInsertId(result) };
}

export async function getContactLinksForRecord(workspaceId: number, recordType: string, recordId: number) {
  const db = await getDb();
  if (!db) return [];
  const { contactLinks } = await import("../drizzle/schema");
  return db.select().from(contactLinks).where(and(eq(contactLinks.workspaceId, workspaceId), eq(contactLinks.recordType, recordType), eq(contactLinks.recordId, recordId)));
}

// ==================== FOLLOWUPS ====================
export async function createFollowup(data: { contactId: number; workspaceId: number; type: string; notes?: string; dueDate?: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { followups } = await import("../drizzle/schema");
  const result = await db.insert(followups).values({ ...data, status: 'pending', createdAt: new Date() } as any);
  return { id: getInsertId(result) };
}

export async function listFollowups(workspaceId: number, contactId?: number) {
  const db = await getDb();
  if (!db) return [];
  const { followups } = await import("../drizzle/schema");
  const conditions: any[] = [eq(followups.workspaceId, workspaceId)];
  if (contactId) conditions.push(eq(followups.contactId, contactId));
  return db.select().from(followups).where(and(...conditions)).orderBy(followups.dueDate);
}

export async function updateFollowup(id: number, workspaceId: number, data: Partial<{ status: string; notes: string; completedAt: Date }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { followups } = await import("../drizzle/schema");
  await db.update(followups).set(data as any).where(and(eq(followups.id, id), eq(followups.workspaceId, workspaceId)));
}

// ==================== CLOSEOUT BLOCKING ITEMS ====================
export async function createCloseoutBlocker(data: { contractId: number; workspaceId: number; title: string; description?: string; category?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { closeoutBlockingItems } = await import("../drizzle/schema");
  const result = await db.insert(closeoutBlockingItems).values({ ...data, status: 'open', createdAt: new Date() } as any);
  return { id: getInsertId(result) };
}

export async function listCloseoutBlockers(workspaceId: number, contractId: number) {
  const db = await getDb();
  if (!db) return [];
  const { closeoutBlockingItems } = await import("../drizzle/schema");
  return db.select().from(closeoutBlockingItems).where(and(eq(closeoutBlockingItems.workspaceId, workspaceId), eq(closeoutBlockingItems.closeoutId, contractId)));
}

export async function updateCloseoutBlocker(id: number, workspaceId: number, data: Partial<{ status: string; resolvedAt: Date; resolvedBy: number; notes: string }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { closeoutBlockingItems } = await import("../drizzle/schema");
  await db.update(closeoutBlockingItems).set(data as any).where(and(eq(closeoutBlockingItems.id, id), eq(closeoutBlockingItems.workspaceId, workspaceId)));
}

// ==================== FINANCE NOTES ====================
export async function createFinanceNote(data: { workspaceId: number; recordType: string; recordId: number; content: string; authorId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { financeNotes } = await import("../drizzle/schema");
  const result = await db.insert(financeNotes).values({ ...data, createdAt: new Date() } as any);
  return { id: getInsertId(result) };
}

export async function listFinanceNotes(workspaceId: number, linkedRecordType: string, linkedRecordId: number) {
  const db = await getDb();
  if (!db) return [];
  const { financeNotes } = await import("../drizzle/schema");
  return db.select().from(financeNotes).where(and(eq(financeNotes.workspaceId, workspaceId), eq(financeNotes.recordType, linkedRecordType as any), eq(financeNotes.recordId, linkedRecordId))).orderBy(financeNotes.createdAt);
}

// ==================== FILE VERSIONS ====================
export async function createFileVersion(data: { fileId: number; workspaceId?: number; versionNumber: number; storageKey: string; storageUrl: string; size?: number; mimeType?: string; uploadedBy?: number; notes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { fileVersions } = await import("../drizzle/schema");
  const result = await db.insert(fileVersions).values({
    fileId: data.fileId,
    workspaceId: data.workspaceId || 0,
    versionNumber: data.versionNumber,
    fileKey: data.storageKey,
    url: data.storageUrl,
    size: data.size,
    mimeType: data.mimeType,
    uploadedBy: data.uploadedBy,
    notes: data.notes,
    createdAt: new Date(),
  } as any);
  return { id: getInsertId(result) };
}

export async function listFileVersions(fileId: number, workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  const { fileVersions } = await import("../drizzle/schema");
  return db.select().from(fileVersions).where(and(eq(fileVersions.fileId, fileId), eq(fileVersions.workspaceId, workspaceId))).orderBy(fileVersions.versionNumber);
}

export async function listAllFileVersionsForWorkspace(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  const { fileVersions, files } = await import("../drizzle/schema");
  return db.select({
    id: fileVersions.id,
    fileId: fileVersions.fileId,
    fileName: files.name,
    fileCategory: files.category,
    versionNumber: fileVersions.versionNumber,
    url: fileVersions.url,
    notes: fileVersions.notes,
    createdAt: fileVersions.createdAt,
  })
    .from(fileVersions)
    .innerJoin(files, eq(fileVersions.fileId, files.id))
    .where(eq(files.workspaceId, workspaceId))
    .orderBy(desc(fileVersions.createdAt));
}

// ==================== CONTRACT REQUIREMENTS ====================
export async function createContractRequirement(data: { contractId: number; workspaceId: number; title: string; description?: string; category?: string; source?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { contractRequirements } = await import("../drizzle/schema");
  const result = await db.insert(contractRequirements).values({ ...data, status: 'pending', createdAt: new Date() } as any);
  return { id: getInsertId(result) };
}

export async function listContractRequirements(workspaceId: number, contractId: number) {
  const db = await getDb();
  if (!db) return [];
  const { contractRequirements } = await import("../drizzle/schema");
  return db.select().from(contractRequirements).where(and(eq(contractRequirements.workspaceId, workspaceId), eq(contractRequirements.contractId, contractId)));
}

export async function updateContractRequirement(id: number, workspaceId: number, data: Partial<{ title: string; description: string; status: string; category: string }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { contractRequirements } = await import("../drizzle/schema");
  await db.update(contractRequirements).set(data as any).where(and(eq(contractRequirements.id, id), eq(contractRequirements.workspaceId, workspaceId)));
}

// ==================== PROPOSAL FRAMEWORKS ====================
export async function listProposalFrameworks() {
  const db = await getDb();
  if (!db) return [];
  const { proposalFrameworks } = await import("../drizzle/schema");
  return db.select().from(proposalFrameworks);
}

export async function getProposalFramework(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { proposalFrameworks } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  const [row] = await db.select().from(proposalFrameworks).where(eq(proposalFrameworks.id, id)).limit(1);
  return row || null;
}

// ==================== PROPOSAL SECTIONS ====================
export async function listProposalSections(workspaceId: number, proposalId: number) {
  const db = await getDb();
  if (!db) return [];
  const { proposalSections } = await import("../drizzle/schema");
  const { and, eq, asc } = await import("drizzle-orm");
  return db.select().from(proposalSections).where(and(eq(proposalSections.workspaceId, workspaceId), eq(proposalSections.proposalId, proposalId))).orderBy(asc(proposalSections.sortOrder));
}

export async function createProposalSection(data: { proposalId: number; workspaceId: number; title: string; content?: string; sortOrder?: number; status?: string; isAiDraft?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { proposalSections } = await import("../drizzle/schema");
  const result = await db.insert(proposalSections).values(data as any);
  return getInsertId(result);
}

export async function updateProposalSection(id: number, workspaceId: number, data: Record<string, any>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { proposalSections } = await import("../drizzle/schema");
  const { and, eq } = await import("drizzle-orm");
  await db.update(proposalSections).set(data as any).where(and(eq(proposalSections.id, id), eq(proposalSections.workspaceId, workspaceId)));
}

export async function deleteProposalSection(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { proposalSections } = await import("../drizzle/schema");
  const { and, eq } = await import("drizzle-orm");
  await db.delete(proposalSections).where(and(eq(proposalSections.id, id), eq(proposalSections.workspaceId, workspaceId)));
}

// ==================== INVOICE LINE ITEMS ====================
export async function listInvoiceLineItems(invoiceId: number, workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  const { invoiceLineItems } = await import("../drizzle/schema");
  return db.select().from(invoiceLineItems).where(and(eq(invoiceLineItems.invoiceId, invoiceId), eq(invoiceLineItems.workspaceId, workspaceId))).orderBy(invoiceLineItems.sortOrder);
}

export async function createInvoiceLineItem(data: { invoiceId: number; workspaceId: number; description: string; quantity: string; unitPrice: string; amount: string; category?: string; sortOrder?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { invoiceLineItems } = await import("../drizzle/schema");
  const result = await db.insert(invoiceLineItems).values(data as any);
  return { id: getInsertId(result) };
}

export async function updateInvoiceLineItem(id: number, workspaceId: number, data: Record<string, any>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { invoiceLineItems } = await import("../drizzle/schema");
  await db.update(invoiceLineItems).set(data as any).where(and(eq(invoiceLineItems.id, id), eq(invoiceLineItems.workspaceId, workspaceId)));
}

export async function deleteInvoiceLineItem(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { invoiceLineItems } = await import("../drizzle/schema");
  await db.delete(invoiceLineItems).where(and(eq(invoiceLineItems.id, id), eq(invoiceLineItems.workspaceId, workspaceId)));
}

// ==================== INVOICE CHECKLIST ITEMS ====================
export async function listInvoiceChecklistItems(invoiceId: number, workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  const { invoiceChecklistItems } = await import("../drizzle/schema");
  return db.select().from(invoiceChecklistItems).where(and(eq(invoiceChecklistItems.invoiceId, invoiceId), eq(invoiceChecklistItems.workspaceId, workspaceId))).orderBy(invoiceChecklistItems.sortOrder);
}

export async function createInvoiceChecklistItem(data: { invoiceId: number; workspaceId: number; title: string; description?: string; required?: boolean; sortOrder?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { invoiceChecklistItems } = await import("../drizzle/schema");
  const result = await db.insert(invoiceChecklistItems).values(data as any);
  return { id: getInsertId(result) };
}

export async function updateInvoiceChecklistItem(id: number, workspaceId: number, data: Record<string, any>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { invoiceChecklistItems } = await import("../drizzle/schema");
  await db.update(invoiceChecklistItems).set(data as any).where(and(eq(invoiceChecklistItems.id, id), eq(invoiceChecklistItems.workspaceId, workspaceId)));
}

export async function deleteInvoiceChecklistItem(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { invoiceChecklistItems } = await import("../drizzle/schema");
  await db.delete(invoiceChecklistItems).where(and(eq(invoiceChecklistItems.id, id), eq(invoiceChecklistItems.workspaceId, workspaceId)));
}

// ==================== INVOICE ISSUES ====================
export async function listInvoiceIssues(invoiceId: number, workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  const { invoiceIssues } = await import("../drizzle/schema");
  return db.select().from(invoiceIssues).where(and(eq(invoiceIssues.invoiceId, invoiceId), eq(invoiceIssues.workspaceId, workspaceId))).orderBy(desc(invoiceIssues.createdAt));
}

export async function createInvoiceIssue(data: { invoiceId: number; workspaceId: number; title: string; description?: string; severity?: string; raisedBy?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { invoiceIssues } = await import("../drizzle/schema");
  const result = await db.insert(invoiceIssues).values(data as any);
  return { id: getInsertId(result) };
}

export async function updateInvoiceIssue(id: number, workspaceId: number, data: Record<string, any>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { invoiceIssues } = await import("../drizzle/schema");
  await db.update(invoiceIssues).set(data as any).where(and(eq(invoiceIssues.id, id), eq(invoiceIssues.workspaceId, workspaceId)));
}

export async function deleteInvoiceIssue(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { invoiceIssues } = await import("../drizzle/schema");
  await db.delete(invoiceIssues).where(and(eq(invoiceIssues.id, id), eq(invoiceIssues.workspaceId, workspaceId)));
}

// ==================== PAYMENT APPLICATIONS ====================
export async function listPaymentApplications(workspaceId: number, paymentId?: number, invoiceId?: number) {
  const db = await getDb();
  if (!db) return [];
  const { paymentApplications } = await import("../drizzle/schema");
  const conditions = [eq(paymentApplications.workspaceId, workspaceId)];
  if (paymentId) conditions.push(eq(paymentApplications.paymentId, paymentId));
  if (invoiceId) conditions.push(eq(paymentApplications.invoiceId, invoiceId));
  return db.select().from(paymentApplications).where(and(...conditions)).orderBy(desc(paymentApplications.createdAt));
}

export async function createPaymentApplication(data: { paymentId: number; invoiceId: number; workspaceId: number; amount: string; notes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { paymentApplications } = await import("../drizzle/schema");
  const result = await db.insert(paymentApplications).values({ ...data, appliedAt: new Date() } as any);
  return { id: getInsertId(result) };
}

export async function deletePaymentApplication(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { paymentApplications } = await import("../drizzle/schema");
  await db.delete(paymentApplications).where(and(eq(paymentApplications.id, id), eq(paymentApplications.workspaceId, workspaceId)));
}

export async function listAllPaymentApplications(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  const { paymentApplications } = await import("../drizzle/schema");
  return db.select().from(paymentApplications).where(eq(paymentApplications.workspaceId, workspaceId)).orderBy(desc(paymentApplications.createdAt));
}

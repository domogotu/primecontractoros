import { drizzle } from "drizzle-orm/mysql2";
import { and, eq, desc, like } from "drizzle-orm";
import {
  files, contacts, messages, invoices, payments, tasks, alerts,
  capabilityStatements, templates, closeoutRecords, lessonsLearned,
  lossReviews, deliverables, deadlines, obligations, complianceItems, notes
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== FILES ====================
export async function listFiles(workspaceId: number, linkedRecordType?: string, linkedRecordId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(files.workspaceId, workspaceId)];
  if (linkedRecordType) conditions.push(eq(files.linkedRecordType, linkedRecordType));
  if (linkedRecordId) conditions.push(eq(files.linkedRecordId, linkedRecordId));
  return db.select().from(files).where(and(...conditions)).orderBy(desc(files.createdAt));
}

export async function createFile(data: { workspaceId: number; name: string; fileKey: string; url: string; mimeType?: string; size?: number; linkedRecordType?: string; linkedRecordId?: number; category?: string; uploadedBy?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(files).values(data as any);
  return { id: result[0].insertId };
}

export async function deleteFile(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(files).where(and(eq(files.id, id), eq(files.workspaceId, workspaceId)));
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
  return { id: result[0].insertId };
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
  return { id: result[0].insertId };
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
  return { id: result[0].insertId };
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
  return { id: result[0].insertId };
}

export async function deletePayment(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(payments).where(and(eq(payments.id, id), eq(payments.workspaceId, workspaceId)));
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
  return { id: result[0].insertId };
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
  return { id: result[0].insertId };
}

export async function dismissAlert(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(alerts).set({ isDismissed: true }).where(and(eq(alerts.id, id), eq(alerts.workspaceId, workspaceId)));
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
  return { id: result[0].insertId };
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
export async function listDeadlines(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deadlines).where(eq(deadlines.workspaceId, workspaceId)).orderBy(desc(deadlines.dueDate));
}

export async function createDeadline(data: { workspaceId: number; title: string; description?: string; dueDate: Date; linkedRecordType?: string; linkedRecordId?: number; priority?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(deadlines).values(data as any);
  return { id: result[0].insertId };
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
  return { id: result[0].insertId };
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
  return { id: result[0].insertId };
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
  return { id: result[0].insertId };
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
  return { id: result[0].insertId };
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
  return { id: result[0].insertId };
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
  return { id: result[0].insertId };
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
  return { id: result[0].insertId };
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
  return { id: result[0].insertId };
}

export async function updateLossReview(id: number, workspaceId: number, data: Partial<{ reasonLost: string; competitorInfo: string; lessonsLearned: string; actionItems: string; status: string }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(lossReviews).set(data as any).where(and(eq(lossReviews.id, id), eq(lossReviews.workspaceId, workspaceId)));
}

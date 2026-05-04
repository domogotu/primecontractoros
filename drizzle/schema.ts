import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Workspaces
export const workspaces = mysqlTable("workspaces", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerId: int("ownerId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = typeof workspaces.$inferInsert;

// Opportunities
export const opportunities = mysqlTable("opportunities", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  agency: varchar("agency", { length: 255 }),
  solicitation: varchar("solicitation", { length: 255 }),
  naics: varchar("naics", { length: 50 }),
  dueDate: timestamp("dueDate"),
  type: varchar("type", { length: 100 }),
  sourceLink: text("sourceLink"),
  summary: text("summary"),
  status: mysqlEnum("status", ["new", "in_review", "pursue", "hold", "no_pursue", "moved_to_proposal", "archived"]).default("new"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = typeof opportunities.$inferInsert;

// Proposals
export const proposals = mysqlTable("proposals", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  opportunityId: int("opportunityId"),
  title: varchar("title", { length: 255 }).notNull(),
  framework: varchar("framework", { length: 100 }),
  dueDate: timestamp("dueDate"),
  status: mysqlEnum("status", ["draft", "in_progress", "under_review", "submitted", "won", "lost", "withdrawn", "archived"]).default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;

// Contracts
export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  proposalId: int("proposalId"),
  title: varchar("title", { length: 255 }).notNull(),
  contractNumber: varchar("contractNumber", { length: 100 }),
  agency: varchar("agency", { length: 255 }),
  value: decimal("value", { precision: 12, scale: 2 }),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  status: mysqlEnum("status", ["setup", "active", "modification", "closeout", "closed", "suspended"]).default("setup"),
  health: mysqlEnum("health", ["healthy", "at_risk", "warning"]).default("healthy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

// AI Runs - Track all AI analysis operations
export const aiRuns = mysqlTable("aiRuns", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  relatedRecordType: varchar("relatedRecordType", { length: 50 }).notNull(), // "opportunity", "proposal", "contract", "file", etc.
  relatedRecordId: int("relatedRecordId"),
  aiType: mysqlEnum("aiType", ["guidance", "analysis", "findings"]).notNull(),
  purpose: varchar("purpose", { length: 255 }),
  modelUsed: varchar("modelUsed", { length: 100 }).default("gpt-4-mini"),
  inputSummary: text("inputSummary"),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiRun = typeof aiRuns.$inferSelect;
export type InsertAiRun = typeof aiRuns.$inferInsert;

// AI Suggestions - Guidance recommendations from AI
export const aiSuggestions = mysqlTable("aiSuggestions", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  aiRunId: int("aiRunId").notNull(),
  relatedRecordType: varchar("relatedRecordType", { length: 50 }).notNull(),
  relatedRecordId: int("relatedRecordId"),
  suggestionTitle: varchar("suggestionTitle", { length: 255 }).notNull(),
  suggestionText: text("suggestionText").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  suggestedAction: text("suggestedAction"),
  status: mysqlEnum("status", ["new", "acknowledged", "accepted", "dismissed", "completed"]).default("new"),
  createdTaskId: int("createdTaskId"),
  dismissedAt: timestamp("dismissedAt"),
  acceptedAt: timestamp("acceptedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiSuggestion = typeof aiSuggestions.$inferSelect;
export type InsertAiSuggestion = typeof aiSuggestions.$inferInsert;

// AI Findings - Source-linked analysis findings
export const aiFindings = mysqlTable("aiFindings", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  aiRunId: int("aiRunId").notNull(),
  contractId: int("contractId"),
  fileId: int("fileId"),
  findingType: varchar("findingType", { length: 100 }).notNull(), // "compliance", "risk", "missing_item", "inconsistency", etc.
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  sourceLocation: varchar("sourceLocation", { length: 500 }), // "page 3, section 4.2"
  sourceExcerpt: text("sourceExcerpt"), // Actual text from source
  practicalMeaning: text("practicalMeaning"), // What this means for the contract
  confidence: int("confidence").default(75), // 0-100 confidence score
  reviewState: mysqlEnum("reviewState", ["unreviewed", "acknowledged", "approved", "rejected", "stale"]).default("unreviewed"),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  approvedLiveObjectType: varchar("approvedLiveObjectType", { length: 50 }), // If approved, what object type it affects
  approvedLiveObjectId: int("approvedLiveObjectId"), // If approved, what object ID it affects
  staleStatus: mysqlEnum("staleStatus", ["current", "stale", "superseded"]).default("current"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiFinding = typeof aiFindings.$inferSelect;
export type InsertAiFinding = typeof aiFindings.$inferInsert;

// AI Finding History - Audit trail for finding changes
export const aiFindingHistory = mysqlTable("aiFindingHistory", {
  id: int("id").autoincrement().primaryKey(),
  findingId: int("findingId").notNull(),
  oldState: varchar("oldState", { length: 50 }),
  newState: varchar("newState", { length: 50 }),
  oldText: text("oldText"),
  newText: text("newText"),
  changedBy: int("changedBy").notNull(),
  reason: text("reason"),
  changedAt: timestamp("changedAt").defaultNow().notNull(),
});

export type AiFindingHistory = typeof aiFindingHistory.$inferSelect;
export type InsertAiFindingHistory = typeof aiFindingHistory.$inferInsert;

// Files - Documents attached to records
export const files = mysqlTable("files", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  url: text("url").notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  size: int("size"),
  linkedRecordType: varchar("linkedRecordType", { length: 50 }), // "opportunity", "proposal", "contract"
  linkedRecordId: int("linkedRecordId"),
  category: varchar("category", { length: 100 }), // "governing", "supporting", "deliverable", "correspondence"
  uploadedBy: int("uploadedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type File = typeof files.$inferSelect;
export type InsertFile = typeof files.$inferInsert;

// Contacts - People associated with records
export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  organization: varchar("organization", { length: 255 }),
  title: varchar("title", { length: 255 }),
  role: varchar("role", { length: 100 }), // "contracting_officer", "program_manager", "subcontractor", "team_member"
  linkedRecordType: varchar("linkedRecordType", { length: 50 }),
  linkedRecordId: int("linkedRecordId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

// Messages - Internal communications
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(),
  senderId: int("senderId").notNull(),
  recipientId: int("recipientId"),
  linkedRecordType: varchar("linkedRecordType", { length: 50 }),
  linkedRecordId: int("linkedRecordId"),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Invoices
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  contractId: int("contractId"),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["draft", "submitted", "approved", "paid", "rejected", "overdue"]).default("draft"),
  issuedDate: timestamp("issuedDate"),
  dueDate: timestamp("dueDate"),
  paidDate: timestamp("paidDate"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// Payments
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  invoiceId: int("invoiceId"),
  contractId: int("contractId"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentDate: timestamp("paymentDate"),
  method: varchar("method", { length: 100 }),
  reference: varchar("reference", { length: 255 }),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// Tasks
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assignedTo: int("assignedTo"),
  linkedRecordType: varchar("linkedRecordType", { length: 50 }),
  linkedRecordId: int("linkedRecordId"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  status: mysqlEnum("status", ["todo", "in_progress", "blocked", "done", "cancelled"]).default("todo"),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// Alerts
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  type: mysqlEnum("type", ["info", "warning", "critical", "success"]).default("info"),
  linkedRecordType: varchar("linkedRecordType", { length: 50 }),
  linkedRecordId: int("linkedRecordId"),
  isRead: boolean("isRead").default(false),
  isDismissed: boolean("isDismissed").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

// Capability Statements
export const capabilityStatements = mysqlTable("capabilityStatements", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  version: varchar("version", { length: 50 }),
  content: text("content"),
  naicsCodes: text("naicsCodes"),
  pastPerformance: text("pastPerformance"),
  differentiators: text("differentiators"),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CapabilityStatement = typeof capabilityStatements.$inferSelect;
export type InsertCapabilityStatement = typeof capabilityStatements.$inferInsert;

// Templates
export const templates = mysqlTable("templates", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }), // "proposal", "invoice", "letter", "report"
  content: text("content"),
  isDefault: boolean("isDefault").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;

// Closeout Records
export const closeoutRecords = mysqlTable("closeoutRecords", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  contractId: int("contractId").notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "pending_review", "completed"]).default("not_started"),
  finalInvoiceSubmitted: boolean("finalInvoiceSubmitted").default(false),
  deliverablesComplete: boolean("deliverablesComplete").default(false),
  governmentPropertyReturned: boolean("governmentPropertyReturned").default(false),
  finalReportSubmitted: boolean("finalReportSubmitted").default(false),
  notes: text("notes"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CloseoutRecord = typeof closeoutRecords.$inferSelect;
export type InsertCloseoutRecord = typeof closeoutRecords.$inferInsert;

// Lessons Learned
export const lessonsLearned = mysqlTable("lessonsLearned", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  contractId: int("contractId"),
  proposalId: int("proposalId"),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }), // "process", "technical", "management", "communication"
  description: text("description"),
  impact: mysqlEnum("impact", ["positive", "negative", "neutral"]).default("neutral"),
  recommendation: text("recommendation"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LessonLearned = typeof lessonsLearned.$inferSelect;
export type InsertLessonLearned = typeof lessonsLearned.$inferInsert;

// Loss Reviews
export const lossReviews = mysqlTable("lossReviews", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  proposalId: int("proposalId").notNull(),
  reviewDate: timestamp("reviewDate"),
  reasonLost: text("reasonLost"),
  competitorInfo: text("competitorInfo"),
  lessonsLearned: text("lessonsLearned"),
  actionItems: text("actionItems"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LossReview = typeof lossReviews.$inferSelect;
export type InsertLossReview = typeof lossReviews.$inferInsert;

// Deliverables
export const deliverables = mysqlTable("deliverables", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  contractId: int("contractId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate"),
  status: mysqlEnum("status", ["not_started", "in_progress", "submitted", "accepted", "rejected", "overdue"]).default("not_started"),
  submittedAt: timestamp("submittedAt"),
  acceptedAt: timestamp("acceptedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Deliverable = typeof deliverables.$inferSelect;
export type InsertDeliverable = typeof deliverables.$inferInsert;

// Deadlines
export const deadlines = mysqlTable("deadlines", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate").notNull(),
  linkedRecordType: varchar("linkedRecordType", { length: 50 }),
  linkedRecordId: int("linkedRecordId"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  status: mysqlEnum("status", ["upcoming", "due_soon", "overdue", "completed"]).default("upcoming"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Deadline = typeof deadlines.$inferSelect;
export type InsertDeadline = typeof deadlines.$inferInsert;

// Obligations
export const obligations = mysqlTable("obligations", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  contractId: int("contractId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  obligationType: varchar("obligationType", { length: 100 }), // "reporting", "delivery", "compliance", "financial"
  frequency: varchar("frequency", { length: 50 }), // "one_time", "weekly", "monthly", "quarterly", "annual"
  dueDate: timestamp("dueDate"),
  status: mysqlEnum("status", ["active", "completed", "overdue", "waived"]).default("active"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Obligation = typeof obligations.$inferSelect;
export type InsertObligation = typeof obligations.$inferInsert;

// Compliance Items
export const complianceItems = mysqlTable("complianceItems", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  contractId: int("contractId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  regulation: varchar("regulation", { length: 255 }), // "FAR 52.219-8", "DFARS 252.204-7012"
  category: varchar("category", { length: 100 }), // "cybersecurity", "labor", "reporting", "environmental"
  status: mysqlEnum("status", ["compliant", "non_compliant", "at_risk", "pending_review", "not_applicable"]).default("pending_review"),
  dueDate: timestamp("dueDate"),
  lastReviewDate: timestamp("lastReviewDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ComplianceItem = typeof complianceItems.$inferSelect;
export type InsertComplianceItem = typeof complianceItems.$inferInsert;

// Notes - General notes attachable to any record
export const notes = mysqlTable("notes", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  linkedRecordType: varchar("linkedRecordType", { length: 50 }),
  linkedRecordId: int("linkedRecordId"),
  authorId: int("authorId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;

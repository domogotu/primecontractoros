import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

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
  accountStatus: mysqlEnum("accountStatus", ["active", "disabled", "suspended"]).default("active").notNull(),
  lastActivityAt: timestamp("lastActivityAt"),
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
  onboardingCompleted: boolean("onboardingCompleted").default(false).notNull(),
  companyName: varchar("companyName", { length: 255 }),
  contractingModel: varchar("contractingModel", { length: 100 }), // "prime", "sub", "both"
  naicsCodes: text("naicsCodes"),
  certifications: text("certifications"),
  planId: int("planId"),
  status: mysqlEnum("status", ["active", "suspended", "deactivated"]).default("active").notNull(),
  trialUsed: boolean("trialUsed").default(false).notNull(),
  lastActivityAt: timestamp("lastActivityAt"),
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
  subAgency: varchar("subAgency", { length: 255 }),
  office: varchar("office", { length: 255 }),
  solicitation: varchar("solicitation", { length: 255 }),
  noticeId: varchar("noticeId", { length: 255 }),
  samOpportunityId: varchar("samOpportunityId", { length: 255 }),
  samUrl: text("samUrl"),
  sourceSystem: varchar("sourceSystem", { length: 100 }),
  naics: varchar("naics", { length: 50 }),
  pscCode: varchar("pscCode", { length: 50 }),
  setAside: varchar("setAside", { length: 100 }),
  setAsideDescription: varchar("setAsideDescription", { length: 255 }),
  noticeType: varchar("noticeType", { length: 100 }),
  dueDate: timestamp("dueDate"),
  postedDate: timestamp("postedDate"),
  archiveDate: timestamp("archiveDate"),
  type: varchar("type", { length: 100 }),
  sourceLink: text("sourceLink"),
  summary: text("summary"),
  description: text("description"),
  placeOfPerformance: text("placeOfPerformance"),
  pointOfContact: text("pointOfContact"),
  status: mysqlEnum("status", ["new", "in_review", "pursue", "hold", "no_pursue", "moved_to_proposal", "archived"]).default("new"),
  reviewStatus: mysqlEnum("reviewStatus", ["needs_review", "in_review", "reviewed", "approved"]).default("needs_review"),
  pursuitDecision: mysqlEnum("pursuitDecision", ["undecided", "pursue", "hold", "no_pursue"]).default("undecided"),
  importStatus: mysqlEnum("importStatus", ["manual", "imported", "synced", "sync_failed"]).default("manual"),
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deletedAt"),
});

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = typeof opportunities.$inferInsert;

// SAM.gov Import Logs - Audit trail for every import/sync operation
export const samImportLogs = mysqlTable("sam_import_logs", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  opportunityId: int("opportunityId"),
  samUrl: text("samUrl"),
  samOpportunityId: varchar("samOpportunityId", { length: 255 }),
  importStatus: varchar("importStatus", { length: 50 }).notNull(),
  apiStatusCode: int("apiStatusCode"),
  errorMessage: text("errorMessage"),
  rawResponseSnapshot: text("rawResponseSnapshot"),
  importedAt: timestamp("importedAt").defaultNow().notNull(),
  importedBy: int("importedBy"),
});
export type SamImportLog = typeof samImportLogs.$inferSelect;
export type InsertSamImportLog = typeof samImportLogs.$inferInsert;

// Opportunity Source Files - SAM.gov attachments and source documents
export const opportunitySourceFiles = mysqlTable("opportunity_source_files", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  opportunityId: int("opportunityId").notNull(),
  fileName: varchar("fileName", { length: 500 }).notNull(),
  fileUrl: text("fileUrl"),
  fileType: varchar("fileType", { length: 100 }),
  sourceSystem: varchar("sourceSystem", { length: 100 }).default("sam.gov"),
  sourceCategory: mysqlEnum("sourceCategory", ["source_notice", "solicitation", "amendment", "attachment", "supporting_document", "screenshot", "other"]).default("attachment"),
  downloadedFilePath: text("downloadedFilePath"),
  isDownloaded: boolean("isDownloaded").default(false),
  isSourceDocument: boolean("isSourceDocument").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type OpportunitySourceFile = typeof opportunitySourceFiles.$inferSelect;
export type InsertOpportunitySourceFile = typeof opportunitySourceFiles.$inferInsert;

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
  deletedAt: timestamp("deletedAt"),
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
  deletedAt: timestamp("deletedAt"),
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
  runType: varchar("runType", { length: 100 }), // "contract_scan", "file_analyze", "opportunity_review", etc.
  purpose: varchar("purpose", { length: 255 }),
  modelUsed: varchar("modelUsed", { length: 100 }).default("gpt-4-mini"),
  inputSummary: text("inputSummary"),
  inputTokens: int("inputTokens").default(0),
  outputTokens: int("outputTokens").default(0),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
  errorMessage: text("errorMessage"),
  completedAt: timestamp("completedAt"),
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
  linkedRecordType: varchar("linkedRecordType", { length: 50 }), // "opportunity", "proposal", "contract", "invoice", "payment", "closeout", "support", "business_profile", "capability_statement", "subcontractor", "vendor"
  linkedRecordId: int("linkedRecordId"),
  category: varchar("category", { length: 100 }), // "governing", "supporting", "deliverable", "correspondence", "modification", "evidence"
  uploadedBy: int("uploadedBy"),
  versionNumber: int("versionNumber").default(1).notNull(),
  isGoverningDocument: boolean("isGoverningDocument").default(false).notNull(),
  documentDate: timestamp("documentDate"),
  notes: text("notes"),
  storageProvider: varchar("storageProvider", { length: 50 }).default("built-in"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
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
  deletedAt: timestamp("deletedAt"),
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
  status: mysqlEnum("status", ["draft", "ready_for_review", "approved", "submitted", "partially_paid", "paid", "disputed", "void", "overdue", "rejected"]).default("draft"),
  issuedDate: timestamp("issuedDate"),
  dueDate: timestamp("dueDate"),
  paidDate: timestamp("paidDate"),
  description: text("description"),
  lastRemindedAt: timestamp("lastRemindedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
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
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded", "recorded", "partially_applied", "fully_applied", "reversed", "disputed", "unapplied"]).default("recorded"),
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
  deletedAt: timestamp("deletedAt"),
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
  summary: text("summary"),
  initiatedBy: int("initiatedBy"),
  completedBy: int("completedBy"),
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
  category: varchar("category", { length: 100 }), // "technical", "management", "cost", "schedule", "compliance", "general"
  lessonType: varchar("lessonType", { length: 100 }).default("other"), // contract_closeout, proposal_win, proposal_loss, subcontractor_teaming, invoice_payment, compliance_requirement, file_documentation, communication_followup, internal_process, other
  description: text("description"),
  impact: mysqlEnum("impact", ["positive", "negative", "neutral"]).default("neutral"),
  impactLevel: mysqlEnum("impactLevel", ["low", "medium", "high", "critical"]).default("medium"),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  rootCause: text("rootCause"),
  recommendation: text("recommendation"),
  whatHappened: text("whatHappened"),
  whatWorked: text("whatWorked"),
  whatDidNotWork: text("whatDidNotWork"),
  actionTaken: text("actionTaken"),
  preventionSteps: text("preventionSteps"),
  linkedRecordType: varchar("linkedRecordType", { length: 64 }), // contract, proposal, opportunity, closeout, invoice, subcontractor
  linkedRecordId: int("linkedRecordId"),
  linkedRecordTitle: varchar("linkedRecordTitle", { length: 255 }),
  status: mysqlEnum("lessonStatus", ["draft", "active", "archived", "applied"]).default("active"),
  visibility: mysqlEnum("visibility", ["workspace", "team", "private"]).default("workspace"),
  appliedToTemplateId: int("appliedToTemplateId"),
  createdTaskId: int("createdTaskId"),
  authorId: int("authorId"),
  tags: varchar("tags", { length: 500 }), // comma-separated tags
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
  lastRemindedAt: timestamp("lastRemindedAt"),
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

// ==================== PLATFORM ADMIN TABLES ====================

// Plans - Subscription plans managed by platform admin
export const plans = mysqlTable("plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).notNull(),
  annualPrice: decimal("annualPrice", { precision: 10, scale: 2 }),
  features: text("features"), // JSON array of feature strings
  maxUsers: int("maxUsers").default(5),
  maxContracts: int("maxContracts").default(10),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = typeof plans.$inferInsert;

// Discounts - Promotional codes and discounts
export const discounts = mysqlTable("discounts", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  percentOff: int("percentOff"), // 0-100
  amountOff: decimal("amountOff", { precision: 10, scale: 2 }),
  maxUses: int("maxUses"),
  currentUses: int("currentUses").default(0),
  applicablePlanId: int("applicablePlanId"), // null = all plans
  isActive: boolean("isActive").default(true).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Discount = typeof discounts.$inferSelect;
export type InsertDiscount = typeof discounts.$inferInsert;

// Platform Billing - Workspace subscription records
export const platformBilling = mysqlTable("platformBilling", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  planId: int("planId").notNull(),
  status: mysqlEnum("status", ["trial", "active", "past_due", "cancelled", "expired"]).default("trial").notNull(),
  billingCycle: mysqlEnum("billingCycle", ["monthly", "annual"]).default("monthly"),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  trialEndsAt: timestamp("trialEndsAt"),
  discountId: int("discountId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlatformBilling = typeof platformBilling.$inferSelect;
export type InsertPlatformBilling = typeof platformBilling.$inferInsert;

// Support Tickets - Customer support requests
export const supportTickets = mysqlTable("supportTickets", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId"),
  userId: int("userId"),
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(),
  category: varchar("category", { length: 100 }),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  status: mysqlEnum("status", ["open", "in_progress", "waiting_on_customer", "resolved", "closed"]).default("open"),
  assignedTo: varchar("assignedTo", { length: 255 }),
  resolution: text("resolution"),
  resolvedAt: timestamp("resolvedAt"),
  closedAt: timestamp("closedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

// Platform Overrides - Feature/config overrides per workspace
export const platformOverrides = mysqlTable("platformOverrides", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  feature: varchar("feature", { length: 100 }).notNull(),
  value: text("value").notNull(),
  reason: text("reason"),
  appliedBy: varchar("appliedBy", { length: 255 }),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlatformOverride = typeof platformOverrides.$inferSelect;
export type InsertPlatformOverride = typeof platformOverrides.$inferInsert;


// Contract CLINs (Contract Line Item Numbers)
export const contractClins = mysqlTable("contractClins", {
  id: int("id").autoincrement().primaryKey(),
  contractId: int("contractId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  clinNumber: varchar("clinNumber", { length: 50 }).notNull(),
  description: text("description"),
  quantity: int("quantity"),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }),
  totalValue: decimal("totalValue", { precision: 12, scale: 2 }),
  status: mysqlEnum("status", ["active", "completed", "cancelled"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ContractClin = typeof contractClins.$inferSelect;
export type InsertContractClin = typeof contractClins.$inferInsert;

// Contract Modifications
export const contractModifications = mysqlTable("contractModifications", {
  id: int("id").autoincrement().primaryKey(),
  contractId: int("contractId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  modNumber: varchar("modNumber", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  modType: mysqlEnum("modType", ["administrative", "funding", "scope", "period_of_performance", "other"]).default("administrative"),
  valueChange: decimal("valueChange", { precision: 12, scale: 2 }),
  effectiveDate: timestamp("effectiveDate"),
  status: mysqlEnum("status", ["draft", "submitted", "approved", "rejected"]).default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ContractModification = typeof contractModifications.$inferSelect;
export type InsertContractModification = typeof contractModifications.$inferInsert;

// Key Personnel
export const keyPersonnel = mysqlTable("keyPersonnel", {
  id: int("id").autoincrement().primaryKey(),
  contractId: int("contractId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  clearanceLevel: varchar("clearanceLevel", { length: 100 }),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type KeyPerson = typeof keyPersonnel.$inferSelect;
export type InsertKeyPerson = typeof keyPersonnel.$inferInsert;

// Proposal Compliance Matrix
export const complianceMatrix = mysqlTable("complianceMatrix", {
  id: int("id").autoincrement().primaryKey(),
  proposalId: int("proposalId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  requirement: text("requirement").notNull(),
  section: varchar("section", { length: 100 }),
  responseLocation: varchar("responseLocation", { length: 255 }),
  assignedTo: varchar("assignedTo", { length: 255 }),
  status: mysqlEnum("status", ["not_started", "in_progress", "complete", "non_compliant"]).default("not_started"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ComplianceMatrixItem = typeof complianceMatrix.$inferSelect;
export type InsertComplianceMatrixItem = typeof complianceMatrix.$inferInsert;

// Audit Log
export const auditLog = mysqlTable("auditLog", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  action: mysqlEnum("action", ["create", "update", "delete", "archive", "restore"]).notNull(),
  entity: varchar("entity", { length: 100 }).notNull(),
  entityId: int("entityId").notNull(),
  changes: text("changes"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type InsertAuditLogEntry = typeof auditLog.$inferInsert;

// Workspace Settings (includes AI configuration)
export const workspaceSettings = mysqlTable("workspaceSettings", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  settingKey: varchar("settingKey", { length: 100 }).notNull(),
  settingValue: text("settingValue"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type WorkspaceSetting = typeof workspaceSettings.$inferSelect;
export type InsertWorkspaceSetting = typeof workspaceSettings.$inferInsert;

// Workspace Members (for role-based access)
export const workspaceMembers = mysqlTable("workspaceMembers", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "admin", "contract_manager", "finance_user", "member", "viewer"]).default("member").notNull(),
  invitedBy: int("invitedBy"),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type InsertWorkspaceMember = typeof workspaceMembers.$inferInsert;

// Email Notifications Log
export const emailNotifications = mysqlTable("emailNotifications", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body").notNull(),
  templateName: varchar("templateName", { length: 100 }),
  status: mysqlEnum("status", ["queued", "sent", "failed", "skipped"]).default("queued").notNull(),
  errorMessage: text("errorMessage"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type EmailNotification = typeof emailNotifications.$inferSelect;
export type InsertEmailNotification = typeof emailNotifications.$inferInsert;

// Closeout Checklist Items (individual items for a closeout record)
export const closeoutChecklistItems = mysqlTable("closeoutChecklistItems", {
  id: int("id").autoincrement().primaryKey(),
  closeoutId: int("closeoutId").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  required: boolean("required").default(true).notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed", "blocked"]).default("not_started"),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  completedBy: int("completedBy"),
  owner: varchar("owner", { length: 255 }),
  dueDate: timestamp("dueDate"),
  category: varchar("category", { length: 100 }),
  sourceAiFindingId: int("sourceAiFindingId"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CloseoutChecklistItem = typeof closeoutChecklistItems.$inferSelect;
export type InsertCloseoutChecklistItem = typeof closeoutChecklistItems.$inferInsert;

// Subscriptions (Stripe billing)
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  planId: int("planId").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  status: mysqlEnum("status", ["active", "past_due", "canceled", "trialing", "incomplete"]).default("active").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;


// Guidance System - Rule-based next-step recommendations
export const guidancePreferences = mysqlTable("guidancePreferences", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  mode: mysqlEnum("mode", ["detailed", "balanced", "light"]).default("balanced").notNull(),
  enabledCategories: text("enabledCategories"), // JSON array of enabled guidance categories
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GuidancePreference = typeof guidancePreferences.$inferSelect;
export type InsertGuidancePreference = typeof guidancePreferences.$inferInsert;

// Suggested next actions based on workspace state
export const suggestedNextActions = mysqlTable("suggestedNextActions", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // "opportunity", "proposal", "contract", "finance", "team", "compliance"
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  actionType: varchar("actionType", { length: 100 }).notNull(), // "create", "review", "update", "complete", "submit"
  targetEntity: varchar("targetEntity", { length: 100 }), // "opportunity", "proposal", "contract", etc.
  targetEntityId: int("targetEntityId"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  reason: text("reason"), // Why this action is suggested
  estimatedMinutes: int("estimatedMinutes"), // How long it might take
  dismissedAt: timestamp("dismissedAt"),
  completedAt: timestamp("completedAt"),
  convertedToTaskId: int("convertedToTaskId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});
export type SuggestedNextAction = typeof suggestedNextActions.$inferSelect;
export type InsertSuggestedNextAction = typeof suggestedNextActions.$inferInsert;

// Guidance events for analytics and history
export const guidanceEvents = mysqlTable("guidanceEvents", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(), // "viewed", "dismissed", "acted_on", "converted_to_task", "completed"
  guidanceCategory: varchar("guidanceCategory", { length: 100 }),
  actionId: int("actionId"),
  metadata: text("metadata"), // JSON object with additional context
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type GuidanceEvent = typeof guidanceEvents.$inferSelect;
export type InsertGuidanceEvent = typeof guidanceEvents.$inferInsert;

// Login Events - Track all login attempts for security visibility
export const loginEvents = mysqlTable("loginEvents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  workspaceId: int("workspaceId"),
  email: varchar("email", { length: 320 }),
  eventType: mysqlEnum("eventType", ["login_success", "login_failure", "logout", "token_refresh", "password_reset"]).notNull(),
  success: boolean("success").default(true).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  deviceInfo: varchar("deviceInfo", { length: 255 }),
  failureReason: varchar("failureReason", { length: 255 }),
  suspiciousFlag: boolean("suspiciousFlag").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type LoginEvent = typeof loginEvents.$inferSelect;
export type InsertLoginEvent = typeof loginEvents.$inferInsert;

// Platform Notes - Admin notes attached to workspaces or users
export const platformNotes = mysqlTable("platformNotes", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId"),
  userId: int("userId"),
  note: text("note").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PlatformNote = typeof platformNotes.$inferSelect;
export type InsertPlatformNote = typeof platformNotes.$inferInsert;

// Platform Audit Log - Track all admin actions (suspend, reactivate, disable, etc.)
export const platformAuditLog = mysqlTable("platformAuditLog", {
  id: int("id").autoincrement().primaryKey(),
  action: varchar("action", { length: 100 }).notNull(), // "suspend_workspace", "reactivate_workspace", "disable_user", "add_note", etc.
  targetType: mysqlEnum("targetType", ["workspace", "user", "plan", "billing", "discount", "backup", "task", "support", "recovery"]).notNull(),
  targetId: int("targetId").notNull(),
  performedBy: int("performedBy").notNull(),
  reason: text("reason"),
  metadata: text("metadata"), // JSON with additional context
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PlatformAuditLogEntry = typeof platformAuditLog.$inferSelect;
export type InsertPlatformAuditLogEntry = typeof platformAuditLog.$inferInsert;

// Admin Invites — tracks onboarding emails sent to prospective team members/contributors
// via PlatformOnboarding.tsx (Send Invite tab). Distinct from onboardingProgress, which
// tracks a customer WORKSPACE's own setup wizard, not admin-sent team invites.
export const adminInvites = mysqlTable("admin_invites", {
  id: int("id").autoincrement().primaryKey(),
  recipientEmail: varchar("recipientEmail", { length: 255 }).notNull(),
  recipientName: varchar("recipientName", { length: 255 }),
  invitedBy: int("invitedBy").notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "stuck", "completed"]).default("not_started").notNull(),
  emailId: varchar("emailId", { length: 255 }), // Resend email id from send result
  lastNudgedAt: timestamp("lastNudgedAt"),
  lastActivityAt: timestamp("lastActivityAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AdminInvite = typeof adminInvites.$inferSelect;
export type InsertAdminInvite = typeof adminInvites.$inferInsert;

// Legal Acceptances
export const legalAcceptances = mysqlTable("legal_acceptances", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  workspaceId: int("workspaceId"),
  documentType: varchar("documentType", { length: 50 }).notNull().default("terms_of_service"),
  documentVersion: varchar("documentVersion", { length: 20 }).notNull().default("1.0"),
  acceptedAt: timestamp("acceptedAt").defaultNow().notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type LegalAcceptance = typeof legalAcceptances.$inferSelect;
export type InsertLegalAcceptance = typeof legalAcceptances.$inferInsert;

// Proposal Team Assignments
export const proposalTeamAssignments = mysqlTable("proposal_team_assignments", {
  id: int("id").autoincrement().primaryKey(),
  proposalId: int("proposalId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  memberName: varchar("memberName", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(),
  sectionResponsibility: varchar("sectionResponsibility", { length: 255 }),
  status: mysqlEnum("status", ["assigned", "in_progress", "review", "complete"]).default("assigned"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ProposalTeamAssignment = typeof proposalTeamAssignments.$inferSelect;


// ============================================================
// AI System — Additional Tables
// ============================================================

// AI Extracted Obligations — temporary holding table before approval
export const aiExtractedObligations = mysqlTable("ai_extracted_obligations", {
  id: int("id").autoincrement().primaryKey(),
  findingId: int("findingId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  obligationType: varchar("obligationType", { length: 100 }).notNull(), // "requirement", "deliverable", "deadline", "compliance_item", "task", "alert"
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate"),
  recurrence: varchar("recurrence", { length: 100 }), // "once", "monthly", "quarterly", "annually"
  evidenceNeeded: text("evidenceNeeded"),
  suggestedOwner: varchar("suggestedOwner", { length: 255 }),
  approvalState: mysqlEnum("approvalState", ["pending", "approved", "rejected", "edited"]).default("pending").notNull(),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  createdRecordType: varchar("createdRecordType", { length: 100 }),
  createdRecordId: int("createdRecordId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AiExtractedObligation = typeof aiExtractedObligations.$inferSelect;
export type InsertAiExtractedObligation = typeof aiExtractedObligations.$inferInsert;

// AI Prompts — reusable internal prompt templates
export const aiPrompts = mysqlTable("ai_prompts", {
  id: int("id").autoincrement().primaryKey(),
  promptKey: varchar("promptKey", { length: 100 }).notNull().unique(),
  promptName: varchar("promptName", { length: 255 }).notNull(),
  systemInstruction: text("systemInstruction").notNull(),
  userTemplate: text("userTemplate").notNull(),
  outputSchema: text("outputSchema"),
  active: boolean("active").default(true).notNull(),
  version: int("version").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AiPrompt = typeof aiPrompts.$inferSelect;
export type InsertAiPrompt = typeof aiPrompts.$inferInsert;

// AI Usage Logs — token/cost tracking per invocation
export const aiUsageLogs = mysqlTable("ai_usage_logs", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  aiRunId: int("aiRunId"),
  featureUsed: varchar("featureUsed", { length: 100 }).notNull(),
  modelUsed: varchar("modelUsed", { length: 100 }).notNull(),
  inputTokens: int("inputTokens").default(0).notNull(),
  outputTokens: int("outputTokens").default(0).notNull(),
  estimatedCost: decimal("estimatedCost", { precision: 10, scale: 6 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AiUsageLog = typeof aiUsageLogs.$inferSelect;
export type InsertAiUsageLog = typeof aiUsageLogs.$inferInsert;


// ============================================================
// System Infrastructure Tables
// ============================================================

// Audit Logs — Global audit trail
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId"),
  userId: int("userId"),
  actionType: varchar("actionType", { length: 100 }).notNull(), // "login", "create", "edit", "archive", "delete", "ai_scan", "ai_approve", "ai_reject", "upload", "status_change", "override"
  targetType: varchar("targetType", { length: 100 }), // "opportunity", "proposal", "contract", "file", "invoice", etc.
  targetId: int("targetId"),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// Notifications — Internal alerts
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId"), // target user (null = all workspace users)
  category: varchar("category", { length: 100 }).notNull(), // "deadline", "review", "missing_info", "billing", "system", "ai"
  title: varchar("title", { length: 500 }).notNull(),
  message: text("message"),
  relatedType: varchar("relatedType", { length: 100 }),
  relatedId: int("relatedId"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  isRead: boolean("isRead").default(false).notNull(),
  dismissedAt: timestamp("dismissedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// System Errors — Error tracking
export const systemErrors = mysqlTable("system_errors", {
  id: int("id").autoincrement().primaryKey(),
  errorType: varchar("errorType", { length: 100 }).notNull(),
  route: varchar("route", { length: 500 }),
  userId: int("userId"),
  workspaceId: int("workspaceId"),
  message: text("message"),
  stackTrace: text("stackTrace"),
  status: mysqlEnum("status", ["new", "investigating", "resolved", "ignored"]).default("new"),
  resolution: text("resolution"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});
export type SystemError = typeof systemErrors.$inferSelect;
export type InsertSystemError = typeof systemErrors.$inferInsert;

// Workspace Roles — Role assignments per workspace
export const workspaceRoles = mysqlTable("workspace_roles", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["workspace_owner", "trusted_admin", "standard_user", "read_only"]).notNull(),
  grantedBy: int("grantedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type WorkspaceRole = typeof workspaceRoles.$inferSelect;
export type InsertWorkspaceRole = typeof workspaceRoles.$inferInsert;

// ==================== 25 Product-Completion Tables ====================

export const onboardingProgress = mysqlTable("onboarding_progress", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspace_id").notNull(),
  userId: int("user_id").notNull(),
  currentStep: int("current_step").notNull().default(1),
  totalSteps: int("total_steps").notNull().default(8),
  stepData: json("step_data"),
  completedSteps: json("completed_steps"),
  percentComplete: int("percent_complete").notNull().default(0),
  status: varchar("status", { length: 32 }).notNull().default("in_progress"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const subcontractors = mysqlTable("subcontractors", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspace_id").notNull(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  pointOfContact: varchar("point_of_contact", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 64 }),
  role: varchar("role", { length: 128 }),
  linkedContractId: int("linked_contract_id"),
  scopeOfWork: text("scope_of_work"),
  requiredDocuments: json("required_documents"),
  insuranceCertEvidence: json("insurance_cert_evidence"),
  flowdownClauses: json("flowdown_clauses"),
  deliverablesAssigned: json("deliverables_assigned"),
  paymentStatus: varchar("payment_status", { length: 64 }),
  performanceNotes: text("performance_notes"),
  status: varchar("status", { length: 32 }).notNull().default("active"),
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const vendors = mysqlTable("vendors", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspace_id").notNull(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  vendorType: varchar("vendor_type", { length: 64 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 64 }),
  address: text("address"),
  certifications: json("certifications"),
  documents: json("documents"),
  notes: text("notes"),
  linkedOpportunityIds: json("linked_opportunity_ids"),
  linkedContractIds: json("linked_contract_ids"),
  status: varchar("status", { length: 32 }).notNull().default("active"),
  performanceHistory: json("performance_history"),
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const invites = mysqlTable("invites", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspace_id").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 64 }).notNull().default("member"),
  invitedBy: int("invited_by").notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  expiresAt: timestamp("expires_at"),
  acceptedAt: timestamp("accepted_at"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type Invite = typeof invites.$inferSelect;
export type InsertInvite = typeof invites.$inferInsert;

export const documentVersions = mysqlTable("document_versions", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspace_id").notNull(),
  documentType: varchar("document_type", { length: 64 }).notNull(),
  documentId: int("document_id"),
  versionNumber: int("version_number").notNull().default(1),
  title: varchar("title", { length: 255 }),
  content: text("content"),
  fileKey: varchar("file_key", { length: 512 }),
  changedBy: int("changed_by"),
  changeNote: text("change_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const migrationsLog = mysqlTable("migrations_log", {
  id: int("id").primaryKey().autoincrement(),
  migrationName: varchar("migration_name", { length: 255 }).notNull(),
  version: varchar("version", { length: 64 }).notNull(),
  appliedAt: timestamp("applied_at").notNull().defaultNow(),
  success: boolean("success").notNull().default(true),
  rollbackNote: text("rollback_note"),
  executionTimeMs: int("execution_time_ms"),
});

export const fileLinks = mysqlTable("file_links", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspace_id").notNull(),
  fileId: int("file_id").notNull(),
  targetType: varchar("target_type", { length: 64 }).notNull(),
  targetId: int("target_id").notNull(),
  linkType: varchar("link_type", { length: 64 }).notNull(),
  isPrimary: boolean("is_primary").default(false),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const planFeatures = mysqlTable("plan_features", {
  id: int("id").primaryKey().autoincrement(),
  planId: int("plan_id").notNull(),
  featureKey: varchar("feature_key", { length: 64 }).notNull(),
  featureValue: varchar("feature_value", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const emailTemplates = mysqlTable("email_templates", {
  id: int("id").primaryKey().autoincrement(),
  templateKey: varchar("template_key", { length: 64 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  htmlBody: text("html_body").notNull(),
  isEnabled: boolean("is_enabled").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const recordTimeline = mysqlTable("record_timeline", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspace_id").notNull(),
  targetType: varchar("target_type", { length: 64 }).notNull(),
  targetId: int("target_id").notNull(),
  eventType: varchar("event_type", { length: 64 }).notNull(),
  description: text("description"),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  userId: int("user_id"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const recordNotes = mysqlTable("record_notes", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspace_id").notNull(),
  targetType: varchar("target_type", { length: 64 }).notNull(),
  targetId: int("target_id").notNull(),
  noteText: text("note_text").notNull(),
  authorId: int("author_id").notNull(),
  isPinned: boolean("is_pinned").notNull().default(false),
  isInternal: boolean("is_internal").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const generatedDocuments = mysqlTable("generated_documents", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspace_id").notNull(),
  documentType: varchar("document_type", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  status: varchar("status", { length: 32 }).notNull().default("draft"),
  generatedBy: varchar("generated_by", { length: 32 }).notNull().default("ai"),
  sourceRecordType: varchar("source_record_type", { length: 64 }),
  sourceRecordId: int("source_record_id"),
  fileKey: varchar("file_key", { length: 512 }),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const flowdownReviews = mysqlTable("flowdown_reviews", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspace_id").notNull(),
  contractId: int("contract_id").notNull(),
  subcontractorId: int("subcontractor_id"),
  clauseReference: varchar("clause_reference", { length: 255 }),
  clauseText: text("clause_text"),
  reviewStatus: varchar("review_status", { length: 32 }).notNull().default("pending"),
  flowdownRequired: boolean("flowdown_required").default(false),
  notes: text("notes"),
  reviewedBy: int("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const customerAdoption = mysqlTable("customer_adoption", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspace_id").notNull(),
  metricKey: varchar("metric_key", { length: 64 }).notNull(),
  metricValue: varchar("metric_value", { length: 255 }),
  lastChecked: timestamp("last_checked"),
  status: varchar("status", { length: 32 }).notNull().default("unknown"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});


// ==================== MISSING TABLES FROM FULL SPEC ====================

// Business Profiles — separate from workspaces, detailed legal/registration info
export const businessProfiles = mysqlTable("business_profiles", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspaceId").notNull(),
  // Company Identity
  legalName: varchar("legalName", { length: 255 }),
  dba: varchar("dba", { length: 255 }),
  businessStructure: varchar("businessStructure", { length: 100 }), // LLC, S-Corp, C-Corp, Sole Proprietor, Partnership
  stateOfIncorporation: varchar("stateOfIncorporation", { length: 100 }),
  businessSize: varchar("businessSize", { length: 50 }), // small, large, other_than_small
  yearFounded: varchar("yearFounded", { length: 10 }),
  numberOfEmployees: varchar("numberOfEmployees", { length: 50 }),
  // Contact & Address
  website: varchar("website", { length: 500 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zip: varchar("zip", { length: 20 }),
  country: varchar("country", { length: 100 }).default("United States"),
  // Government Registrations
  uei: varchar("uei", { length: 50 }),
  cage: varchar("cage", { length: 20 }),
  samStatus: mysqlEnum("samStatus", ["active", "expired", "pending", "not_registered"]).default("not_registered"),
  samExpirationDate: timestamp("samExpirationDate"),
  samRegistrationDate: timestamp("samRegistrationDate"),
  gsaScheduleNumber: varchar("gsaScheduleNumber", { length: 100 }),
  gsaScheduleExpiration: timestamp("gsaScheduleExpiration"),
  // NAICS
  naicsPrimary: varchar("naicsPrimary", { length: 20 }),
  naicsSecondary: text("naicsSecondary"), // JSON array of {code, description}
  // Socioeconomic Certifications — JSON array of {name, certNumber, expirationDate, issuingAgency}
  socioeconomicCerts: text("socioeconomicCerts"),
  // Key Personnel — JSON array of {name, title, clearanceLevel, role, email, phone}
  keyPersonnel: text("keyPersonnel"),
  // Capabilities
  capabilities: text("capabilities"),
  coreCompetencies: text("coreCompetencies"),
  // Past Performance — JSON array of {contractNumber, agency, description, value, periodOfPerformance, contactName, contactPhone}
  pastPerformance: text("pastPerformance"),
  // Financial
  bankingInfo: text("bankingInfo"), // JSON: {bankName, accountName, routingNumber, accountNumber, paymentMethod}
  bondingCapacity: varchar("bondingCapacity", { length: 100 }),
  insuranceSummary: text("insuranceSummary"), // JSON: {generalLiability, professionalLiability, workersComp, cyber}
  annualRevenue: varchar("annualRevenue", { length: 100 }),
  // Contracting Model
  contractingModel: mysqlEnum("contractingModel", ["prime", "sub", "both"]).default("prime"),
  usesSubcontractors: boolean("usesSubcontractors").default(false),
  // Legacy fields
  naicsCodes: text("naicsCodes"),
  certifications: text("certifications"),
  entityType: varchar("entityType", { length: 100 }),
  defaultContactName: varchar("defaultContactName", { length: 255 }),
  defaultContactEmail: varchar("defaultContactEmail", { length: 320 }),
  defaultContactPhone: varchar("defaultContactPhone", { length: 50 }),
  profileCompletenessScore: int("profileCompletenessScore").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type BusinessProfile = typeof businessProfiles.$inferSelect;
export type InsertBusinessProfile = typeof businessProfiles.$inferInsert;

// Access States — workspace access/subscription lifecycle state
export const accessStates = mysqlTable("access_states", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspaceId").notNull(),
  state: mysqlEnum("state", [
    "signup_started", "pending_setup", "trial_active", "limited_access",
    "pending_payment", "active_paid", "past_due", "suspended", "canceled", "archived",
    "grace", "override"
  ]).default("signup_started").notNull(),
  previousState: varchar("previousState", { length: 50 }),
  changedAt: timestamp("changedAt").defaultNow().notNull(),
  changedBy: int("changedBy"),
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AccessState = typeof accessStates.$inferSelect;
export type InsertAccessState = typeof accessStates.$inferInsert;

// Discount Usage — track which workspaces used which discounts
export const discountUsage = mysqlTable("discount_usage", {
  id: int("id").primaryKey().autoincrement(),
  discountId: int("discountId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
  amountSaved: decimal("amountSaved", { precision: 10, scale: 2 }),
});
export type DiscountUsageEntry = typeof discountUsage.$inferSelect;

// Billing Events — audit trail for billing state changes
export const billingEvents = mysqlTable("billing_events", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspaceId").notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  oldState: varchar("oldState", { length: 50 }),
  newState: varchar("newState", { length: 50 }),
  reason: text("reason"),
  adminId: int("adminId"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type BillingEvent = typeof billingEvents.$inferSelect;

// Support Messages — replies and internal notes on support tickets
export const supportMessages = mysqlTable("support_messages", {
  id: int("id").primaryKey().autoincrement(),
  ticketId: int("ticketId").notNull(),
  senderType: mysqlEnum("senderType", ["customer", "admin"]).notNull(),
  senderId: int("senderId"),
  senderName: varchar("senderName", { length: 255 }),
  content: text("content").notNull(),
  isInternalNote: boolean("isInternalNote").default(false).notNull(),
  attachmentFileId: int("attachmentFileId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SupportMessage = typeof supportMessages.$inferSelect;
export type InsertSupportMessage = typeof supportMessages.$inferInsert;

// Proposal Frameworks — reusable proposal structure templates
export const proposalFrameworks = mysqlTable("proposal_frameworks", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  frameworkType: mysqlEnum("frameworkType", ["standard", "technical", "subcontract", "simple", "blank"]).default("standard"),
  sections: text("sections"), // JSON array of default section definitions
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ProposalFramework = typeof proposalFrameworks.$inferSelect;

// Proposal Sections — individual sections within a proposal
export const proposalSections = mysqlTable("proposal_sections", {
  id: int("id").primaryKey().autoincrement(),
  proposalId: int("proposalId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  sortOrder: int("sortOrder").default(0).notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "complete", "needs_review"]).default("not_started"),
  isAiDraft: boolean("isAiDraft").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ProposalSection = typeof proposalSections.$inferSelect;

// Contract Requirements — extracted or manually added requirements
export const contractRequirements = mysqlTable("contract_requirements", {
  id: int("id").primaryKey().autoincrement(),
  contractId: int("contractId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  sourceFileId: int("sourceFileId"),
  sourceLocation: varchar("sourceLocation", { length: 500 }),
  status: mysqlEnum("status", ["open", "met", "waived", "in_progress"]).default("open"),
  aiFindingId: int("aiFindingId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ContractRequirement = typeof contractRequirements.$inferSelect;

// Contact Links — many-to-many linking contacts to records
export const contactLinks = mysqlTable("contact_links", {
  id: int("id").primaryKey().autoincrement(),
  contactId: int("contactId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  recordType: varchar("recordType", { length: 64 }).notNull(),
  recordId: int("recordId").notNull(),
  role: varchar("role", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ContactLink = typeof contactLinks.$inferSelect;

// Followups — scheduled follow-up actions for contacts
export const followups = mysqlTable("followups", {
  id: int("id").primaryKey().autoincrement(),
  contactId: int("contactId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  dueDate: timestamp("dueDate"),
  notes: text("notes"),
  status: mysqlEnum("status", ["pending", "complete"]).default("pending"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Followup = typeof followups.$inferSelect;

// Invoice Payment Links — many-to-many matching payments to invoices
export const invoicePaymentLinks = mysqlTable("invoice_payment_links", {
  id: int("id").primaryKey().autoincrement(),
  invoiceId: int("invoiceId").notNull(),
  paymentId: int("paymentId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  amountApplied: decimal("amountApplied", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type InvoicePaymentLink = typeof invoicePaymentLinks.$inferSelect;

// Invoice Status History — audit trail for invoice status changes
export const invoiceStatusHistory = mysqlTable("invoice_status_history", {
  id: int("id").primaryKey().autoincrement(),
  invoiceId: int("invoiceId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  oldStatus: varchar("oldStatus", { length: 50 }),
  newStatus: varchar("newStatus", { length: 50 }).notNull(),
  changedBy: int("changedBy"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type InvoiceStatusHistoryEntry = typeof invoiceStatusHistory.$inferSelect;

// Finance Notes — notes attached to invoices or payments
export const financeNotes = mysqlTable("finance_notes", {
  id: int("id").primaryKey().autoincrement(),
  recordType: mysqlEnum("recordType", ["invoice", "payment"]).notNull(),
  recordId: int("recordId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  content: text("content").notNull(),
  authorId: int("authorId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type FinanceNote = typeof financeNotes.$inferSelect;

// Closeout Blocking Items — specific blockers preventing contract closeout
export const closeoutBlockingItems = mysqlTable("closeout_blocking_items", {
  id: int("id").primaryKey().autoincrement(),
  closeoutId: int("closeoutId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  blockerType: varchar("blockerType", { length: 100 }).notNull(),
  description: text("description"),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  recordType: varchar("recordType", { length: 64 }),
  recordId: int("recordId"),
  status: mysqlEnum("status", ["open", "resolved", "waived"]).default("open"),
  resolutionNotes: text("resolutionNotes"),
  owner: varchar("owner", { length: 255 }),
  dueDate: timestamp("dueDate"),
  resolvedAt: timestamp("resolvedAt"),
  resolvedBy: int("resolvedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CloseoutBlockingItem = typeof closeoutBlockingItems.$inferSelect;

// Capability Statement Versions — version history for capability statements
export const capabilityStatementVersions = mysqlTable("capability_statement_versions", {
  id: int("id").primaryKey().autoincrement(),
  capabilityStatementId: int("capabilityStatementId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  versionNumber: int("versionNumber").notNull(),
  content: text("content"),
  targetAudience: varchar("targetAudience", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CapabilityStatementVersion = typeof capabilityStatementVersions.$inferSelect;

// Template Versions — version history for templates
export const templateVersions = mysqlTable("template_versions", {
  id: int("id").primaryKey().autoincrement(),
  templateId: int("templateId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  versionNumber: int("versionNumber").notNull(),
  content: text("content"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type TemplateVersion = typeof templateVersions.$inferSelect;

// File Versions — version history for uploaded files
export const fileVersions = mysqlTable("file_versions", {
  id: int("id").primaryKey().autoincrement(),
  fileId: int("fileId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  versionNumber: int("versionNumber").notNull().default(1),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  url: text("url").notNull(),
  size: int("size"),
  mimeType: varchar("mimeType", { length: 100 }),
  uploadedBy: int("uploadedBy"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type FileVersion = typeof fileVersions.$inferSelect;

// Consent Records — server-side audit trail for user consent (GDPR/CCPA)
export const consentRecords = mysqlTable("consent_records", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  workspaceId: int("workspaceId"),
  consentType: varchar("consentType", { length: 100 }).notNull().default("terms_and_privacy"),
  policyVersion: varchar("policyVersion", { length: 50 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(), // 'accepted' | 'declined'
  ipAddress: varchar("ipAddress", { length: 100 }),
  userAgent: varchar("userAgent", { length: 500 }),
  acceptedAt: timestamp("acceptedAt").defaultNow().notNull(),
});
export type ConsentRecord = typeof consentRecords.$inferSelect;


// ==================== PLATFORM ADMIN EXTENDED TABLES ====================

// Workspace Health Flags — risk/attention indicators per workspace
export const workspaceHealthFlags = mysqlTable("workspace_health_flags", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspaceId").notNull(),
  flagType: varchar("flagType", { length: 100 }).notNull(), // "payment_overdue", "inactive_30d", "trial_expiring", "support_escalation", "onboarding_stalled", "high_error_rate", "user_churn_risk"
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("warning").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  resolvedAt: timestamp("resolvedAt"),
  resolvedBy: int("resolvedBy"),
  resolutionNote: text("resolutionNote"),
  metadata: text("metadata"), // JSON with additional context
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type WorkspaceHealthFlag = typeof workspaceHealthFlags.$inferSelect;
export type InsertWorkspaceHealthFlag = typeof workspaceHealthFlags.$inferInsert;

// Platform Activity Log — cross-workspace activity feed for admin dashboard
export const platformActivityLog = mysqlTable("platform_activity_log", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspaceId"),
  userId: int("userId"),
  activityType: varchar("activityType", { length: 100 }).notNull(), // "workspace_created", "user_signup", "plan_upgrade", "plan_downgrade", "payment_received", "payment_failed", "support_ticket_opened", "support_ticket_resolved", "workspace_suspended", "workspace_reactivated", "user_disabled", "user_enabled", "trial_started", "trial_expired", "onboarding_completed"
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  metadata: text("metadata"), // JSON with additional context
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PlatformActivityLogEntry = typeof platformActivityLog.$inferSelect;
export type InsertPlatformActivityLogEntry = typeof platformActivityLog.$inferInsert;


// ==================== PLATFORM ADMIN BUSINESS CONTROL TABLES ====================

// Plan Versions — audit trail for plan changes
export const planVersions = mysqlTable("plan_versions", {
  id: int("id").primaryKey().autoincrement(),
  planId: int("planId").notNull(),
  changeType: varchar("changeType", { length: 50 }).notNull(), // 'created', 'updated', 'archived', 'duplicated'
  changedFields: text("changedFields"), // JSON of what changed
  previousValues: text("previousValues"), // JSON of old values
  newValues: text("newValues"), // JSON of new values
  changedBy: int("changedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PlanVersion = typeof planVersions.$inferSelect;

// Policy Versions — track versions of legal policies
export const policyVersions = mysqlTable("policy_versions", {
  id: int("id").primaryKey().autoincrement(),
  policyType: varchar("policyType", { length: 100 }).notNull(), // 'terms_of_service', 'privacy_policy', 'billing_authorization', etc.
  version: varchar("version", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  isActive: boolean("isActive").default(true).notNull(),
  publishedAt: timestamp("publishedAt"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PolicyVersion = typeof policyVersions.$inferSelect;

// Backup Exports — log of all admin data exports
export const backupExports = mysqlTable("backup_exports", {
  id: int("id").primaryKey().autoincrement(),
  exportType: varchar("exportType", { length: 100 }).notNull(), // 'full_csv', 'full_json', 'table_csv', 'table_json', 'workspace_export', 'category_export'
  tableName: varchar("tableName", { length: 100 }),
  workspaceId: int("workspaceId"),
  fileSize: int("fileSize"),
  status: varchar("status", { length: 50 }).default("completed").notNull(),
  notes: text("notes"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type BackupExport = typeof backupExports.$inferSelect;

// Platform Tasks — scheduled/background platform jobs
export const platformTasks = mysqlTable("platform_tasks", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  taskType: varchar("taskType", { length: 100 }).notNull(), // 'database_backup', 'email_digest', 'trial_expiration_check', 'billing_status_check', 'payment_retry_check', 'workspace_cleanup', 'support_reminder_check', 'ai_usage_sync', 'data_export_cleanup', 'consent_audit_check', 'security_activity_review', 'stale_workspace_check'
  description: text("description"),
  schedule: varchar("schedule", { length: 100 }), // cron expression or 'manual'
  isEnabled: boolean("isEnabled").default(true).notNull(),
  lastRunAt: timestamp("lastRunAt"),
  nextRunAt: timestamp("nextRunAt"),
  lastDurationMs: int("lastDurationMs"),
  lastResult: varchar("lastResult", { length: 50 }), // 'success', 'failed', 'partial', 'skipped'
  lastError: text("lastError"),
  retryCount: int("retryCount").default(0),
  relatedWorkspaceId: int("relatedWorkspaceId"),
  metadata: text("metadata"), // JSON config
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PlatformTask = typeof platformTasks.$inferSelect;

// Platform Task Runs — execution history for platform tasks
export const platformTaskRuns = mysqlTable("platform_task_runs", {
  id: int("id").primaryKey().autoincrement(),
  taskId: int("taskId").notNull(),
  status: varchar("status", { length: 50 }).notNull(), // 'running', 'success', 'failed', 'partial', 'skipped'
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  durationMs: int("durationMs"),
  result: text("result"), // JSON summary
  errorMessage: text("errorMessage"),
  triggeredBy: varchar("triggeredBy", { length: 50 }).default("scheduled"), // 'scheduled', 'manual', 'retry'
  triggeredByUserId: int("triggeredByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PlatformTaskRun = typeof platformTaskRuns.$inferSelect;


// Admin Tasks — operational tasks for platform admins
export const adminTasks = mysqlTable("admin_tasks", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["open", "completed", "cancelled"]).default("open").notNull(),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  createdBy: int("createdBy").notNull(),
  assignedTo: int("assignedTo"),
  tags: text("tags"), // JSON array of tag strings
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AdminTask = typeof adminTasks.$inferSelect;
export type InsertAdminTask = typeof adminTasks.$inferInsert;

// Webhooks — user-configurable outbound webhook endpoints
export const webhooks = mysqlTable("webhooks", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  url: varchar("url", { length: 2048 }).notNull(),
  description: varchar("description", { length: 255 }),
  secret: varchar("secret", { length: 255 }), // HMAC signing secret
  events: text("events").notNull(), // JSON array of subscribed event types
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

// Webhook delivery log
export const webhookDeliveries = mysqlTable("webhook_deliveries", {
  id: int("id").autoincrement().primaryKey(),
  webhookId: int("webhookId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  payload: text("payload").notNull(), // JSON
  responseStatus: int("responseStatus"),
  responseBody: text("responseBody"),
  success: boolean("success").default(false).notNull(),
  attemptCount: int("attemptCount").default(1).notNull(),
  nextRetryAt: timestamp("nextRetryAt"),
  deliveredAt: timestamp("deliveredAt").defaultNow().notNull(),
});

export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type InsertWebhookDelivery = typeof webhookDeliveries.$inferInsert;

// Email notification preferences per user
export const emailPreferences = mysqlTable("email_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  deadlineReminders: boolean("deadlineReminders").default(true).notNull(),
  invoiceAlerts: boolean("invoiceAlerts").default(true).notNull(),
  contractStatusChanges: boolean("contractStatusChanges").default(true).notNull(),
  proposalUpdates: boolean("proposalUpdates").default(true).notNull(),
  weeklyDigest: boolean("weeklyDigest").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailPreference = typeof emailPreferences.$inferSelect;
export type InsertEmailPreference = typeof emailPreferences.$inferInsert;

// Change orders / contract modifications
export const changeOrders = mysqlTable("change_orders", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  contractId: int("contractId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  changeType: varchar("changeType", { length: 64 }).notNull().default("scope"),
  status: varchar("status", { length: 64 }).notNull().default("draft"),
  impactCost: varchar("impactCost", { length: 64 }),
  impactSchedule: varchar("impactSchedule", { length: 128 }),
  submittedBy: varchar("submittedBy", { length: 255 }),
  reviewedBy: varchar("reviewedBy", { length: 255 }),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ChangeOrder = typeof changeOrders.$inferSelect;
export type InsertChangeOrder = typeof changeOrders.$inferInsert;

// =============================================
// PRIORITY 1: Guidance Question Bank System
// =============================================
export const guidanceQuestions = mysqlTable("guidance_questions", {
  id: int("id").autoincrement().primaryKey(),
  guidanceWord: varchar("guidanceWord", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  who: text("who"),
  what: text("what"),
  whenField: text("whenField"),
  whereField: text("whereField"),
  why: text("why"),
  how: text("how"),
  authorityCheck: text("authorityCheck"),
  scopeCheck: text("scopeCheck"),
  fundingCheck: text("fundingCheck"),
  complianceCheck: text("complianceCheck"),
  evidenceCheck: text("evidenceCheck"),
  reviewCheck: text("reviewCheck"),
  riskCheck: text("riskCheck"),
  consequenceCheck: text("consequenceCheck"),
  nextBestAction: text("nextBestAction"),
  systemAction: varchar("systemAction", { length: 255 }),
  pageContext: varchar("pageContext", { length: 100 }).notNull(),
  recordType: varchar("recordType", { length: 100 }),
  priority: varchar("priority", { length: 20 }).default("medium"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GuidanceQuestion = typeof guidanceQuestions.$inferSelect;
export type InsertGuidanceQuestion = typeof guidanceQuestions.$inferInsert;

export const guidanceQuestionDismissals = mysqlTable("guidance_question_dismissals", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  questionId: int("questionId").notNull(),
  dismissedAt: timestamp("dismissedAt").defaultNow().notNull(),
});
export type GuidanceQuestionDismissal = typeof guidanceQuestionDismissals.$inferSelect;
export type InsertGuidanceQuestionDismissal = typeof guidanceQuestionDismissals.$inferInsert;

// =============================================
// PRIORITY 2: Smart Intake - Import History
// =============================================
export const importHistoryTable = mysqlTable("import_history", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  source: varchar("source", { length: 100 }).notNull(),
  sourceUrl: text("sourceUrl"),
  recordType: varchar("recordType", { length: 50 }).notNull(),
  recordId: int("recordId"),
  recordCount: int("recordCount").default(1),
  status: varchar("status", { length: 20 }).default("success"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ImportHistoryRecord = typeof importHistoryTable.$inferSelect;
export type InsertImportHistory = typeof importHistoryTable.$inferInsert;

// =============================================
// PRIORITY 4: Rate Parity Testing
// =============================================
export const rateParityChecks = mysqlTable("rate_parity_checks", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  source: varchar("source", { length: 100 }).notNull(),
  sourceId: int("sourceId"),
  sourceLabel: varchar("sourceLabel", { length: 255 }),
  target: varchar("target", { length: 100 }).notNull(),
  targetId: int("targetId"),
  targetLabel: varchar("targetLabel", { length: 255 }),
  rateType: varchar("rateType", { length: 100 }),
  expectedRate: varchar("expectedRate", { length: 50 }),
  actualRate: varchar("actualRate", { length: 50 }),
  variance: varchar("variance", { length: 50 }),
  variancePercent: varchar("variancePercent", { length: 20 }),
  status: varchar("status", { length: 20 }).default("pass"),
  notes: text("notes"),
  checkedAt: timestamp("checkedAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type RateParityCheck = typeof rateParityChecks.$inferSelect;
export type InsertRateParityCheck = typeof rateParityChecks.$inferInsert;

// =============================================
// PRIORITY 6: Training/Walkthrough System
// =============================================
export const trainingModules = mysqlTable("training_modules", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  steps: text("steps").notNull(),
  targetPage: varchar("targetPage", { length: 100 }).notNull(),
  orderIndex: int("orderIndex").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TrainingModule = typeof trainingModules.$inferSelect;
export type InsertTrainingModule = typeof trainingModules.$inferInsert;

export const trainingCompletions = mysqlTable("training_completions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  moduleId: int("moduleId").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});
export type TrainingCompletion = typeof trainingCompletions.$inferSelect;
export type InsertTrainingCompletion = typeof trainingCompletions.$inferInsert;

// =============================================
// PRIORITY 7: Recent Records + Autosave Drafts
// =============================================
export const recentRecords = mysqlTable("recent_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  recordType: varchar("recordType", { length: 50 }).notNull(),
  recordId: int("recordId").notNull(),
  recordTitle: varchar("recordTitle", { length: 255 }),
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
});
export type RecentRecord = typeof recentRecords.$inferSelect;
export type InsertRecentRecord = typeof recentRecords.$inferInsert;

export const autosaveDrafts = mysqlTable("autosave_drafts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  recordType: varchar("recordType", { length: 50 }).notNull(),
  recordId: int("recordId"),
  formData: text("formData").notNull(),
  savedAt: timestamp("savedAt").defaultNow().notNull(),
});
export type AutosaveDraft = typeof autosaveDrafts.$inferSelect;
export type InsertAutosaveDraft = typeof autosaveDrafts.$inferInsert;

// =============================================
// PRIORITY 7: Status Automation Rules
// =============================================
export const statusAutomationRules = mysqlTable("status_automation_rules", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  recordType: varchar("recordType", { length: 50 }).notNull(),
  triggerCondition: varchar("triggerCondition", { length: 100 }).notNull(),
  fromStatus: varchar("fromStatus", { length: 50 }).notNull(),
  toStatus: varchar("toStatus", { length: 50 }).notNull(),
  description: text("description"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type StatusAutomationRule = typeof statusAutomationRules.$inferSelect;
export type InsertStatusAutomationRule = typeof statusAutomationRules.$inferInsert;
// =============================================
// PRIORITY 7: Record Templates
// =============================================
export const recordTemplates = mysqlTable("record_templates", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  createdBy: int("createdBy").notNull(),
  recordType: varchar("recordType", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  templateData: text("templateData").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type RecordTemplate = typeof recordTemplates.$inferSelect;
export type InsertRecordTemplate = typeof recordTemplates.$inferInsert;
// =============================================
// PRIORITY 7: Dashboard Widgets
// =============================================
export const dashboardWidgets = mysqlTable("dashboard_widgets", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  widgetType: varchar("widgetType", { length: 100 }).notNull(),
  position: int("position").default(0),
  width: int("width").default(2),
  height: int("height").default(1),
  isVisible: boolean("isVisible").default(true),
  config: text("config"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
export type InsertDashboardWidget = typeof dashboardWidgets.$inferInsert;

// =============================================
// FAR/DFARS CLAUSE REFERENCE SYSTEM
// =============================================

// Main clause library table
export const farDfarsClauses = mysqlTable("far_dfars_clauses", {
  id: int("id").autoincrement().primaryKey(),
  clauseNumber: varchar("clauseNumber", { length: 50 }).notNull(),
  sourceType: mysqlEnum("sourceType", ["FAR", "DFARS", "Agency Supplement", "Contract-Specific", "Other"]).default("FAR").notNull(),
  farPart: varchar("farPart", { length: 50 }),
  title: varchar("title", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }),
  summary: text("summary"),
  plainLanguageMeaning: text("plainLanguageMeaning"),
  whyItMatters: text("whyItMatters"),
  applicabilityNote: text("applicabilityNote"),
  commonRecordsAffected: text("commonRecordsAffected"),
  operationalImpact: text("operationalImpact"),
  evidenceExpectations: text("evidenceExpectations"),
  flowdownWatch: boolean("flowdownWatch").default(false),
  subcontractingWatch: boolean("subcontractingWatch").default(false),
  cybersecurityWatch: boolean("cybersecurityWatch").default(false),
  paymentWatch: boolean("paymentWatch").default(false),
  smallBusinessWatch: boolean("smallBusinessWatch").default(false),
  laborWatch: boolean("laborWatch").default(false),
  closeoutWatch: boolean("closeoutWatch").default(false),
  officialSourceUrl: text("officialSourceUrl"),
  isCustom: boolean("isCustom").default(false),
  isGlobal: boolean("isGlobal").default(true),
  workspaceId: int("workspaceId"),
  tags: text("tags"),
  effectiveDate: varchar("effectiveDate", { length: 50 }),
  status: mysqlEnum("clauseStatus", ["active", "inactive", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FarDfarsClause = typeof farDfarsClauses.$inferSelect;
export type InsertFarDfarsClause = typeof farDfarsClauses.$inferInsert;

// Bookmarks
export const farDfarsBookmarks = mysqlTable("far_dfars_bookmarks", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  clauseId: int("clauseId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type FarDfarsBookmark = typeof farDfarsBookmarks.$inferSelect;
export type InsertFarDfarsBookmark = typeof farDfarsBookmarks.$inferInsert;

// Clause links to other records
export const farDfarsClauseLinks = mysqlTable("far_dfars_clause_links", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  clauseId: int("clauseId").notNull(),
  linkedRecordType: varchar("linkedRecordType", { length: 100 }).notNull(),
  linkedRecordId: int("linkedRecordId"),
  contractId: int("contractId"),
  sourceFileId: int("sourceFileId"),
  sourceLocation: text("sourceLocation"),
  relevanceStatus: varchar("relevanceStatus", { length: 50 }).default("reference_only"),
  reviewStatus: varchar("linkReviewStatus", { length: 50 }).default("pending"),
  sourceStrength: varchar("sourceStrength", { length: 50 }).default("general_reference"),
  note: text("note"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FarDfarsClauseLink = typeof farDfarsClauseLinks.$inferSelect;
export type InsertFarDfarsClauseLink = typeof farDfarsClauseLinks.$inferInsert;

// Clause notes
export const farDfarsClauseNotes = mysqlTable("far_dfars_clause_notes", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  clauseId: int("clauseId").notNull(),
  contractId: int("contractId"),
  noteType: varchar("noteType", { length: 50 }).default("internal"),
  noteText: text("noteText").notNull(),
  reviewStatus: varchar("noteReviewStatus", { length: 50 }).default("draft"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FarDfarsClauseNote = typeof farDfarsClauseNotes.$inferSelect;
export type InsertFarDfarsClauseNote = typeof farDfarsClauseNotes.$inferInsert;

// Flowdown reviews
export const farDfarsFlowdownReviews = mysqlTable("far_dfars_flowdown_reviews", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  clauseId: int("clauseId").notNull(),
  contractId: int("contractId"),
  subcontractorContactId: int("subcontractorContactId"),
  flowdownStatus: varchar("flowdownStatus", { length: 50 }).default("not_started"),
  limitationWatch: boolean("limitationWatch").default(false),
  subcontractingPlanWatch: boolean("subcontractingPlanWatch").default(false),
  consentWatch: boolean("consentWatch").default(false),
  cybersecurityFlowdownWatch: boolean("cybersecurityFlowdownWatch").default(false),
  paymentFlowdownWatch: boolean("paymentFlowdownWatch").default(false),
  laborFlowdownWatch: boolean("laborFlowdownWatch").default(false),
  notes: text("notes"),
  reviewedBy: int("reviewedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FarDfarsFlowdownReview = typeof farDfarsFlowdownReviews.$inferSelect;
export type InsertFarDfarsFlowdownReview = typeof farDfarsFlowdownReviews.$inferInsert;

// Clause source matches (AI or manual extraction from files)
export const farDfarsSourceMatches = mysqlTable("far_dfars_source_matches", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  clauseId: int("clauseId").notNull(),
  sourceFileId: int("sourceFileId"),
  linkedRecordType: varchar("linkedRecordType", { length: 100 }),
  linkedRecordId: int("linkedRecordId"),
  sourceLocation: text("sourceLocation"),
  extractedTextSnippet: text("extractedTextSnippet"),
  extractionMethod: varchar("extractionMethod", { length: 50 }).default("manual"),
  matchReviewStatus: varchar("matchReviewStatus", { length: 50 }).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FarDfarsSourceMatch = typeof farDfarsSourceMatches.$inferSelect;
export type InsertFarDfarsSourceMatch = typeof farDfarsSourceMatches.$inferInsert;

// Clause review events (audit trail)
export const farDfarsReviewEvents = mysqlTable("far_dfars_review_events", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  clauseId: int("clauseId").notNull(),
  linkedRecordType: varchar("linkedRecordType", { length: 100 }),
  linkedRecordId: int("linkedRecordId"),
  action: varchar("action", { length: 100 }).notNull(),
  oldStatus: varchar("oldStatus", { length: 100 }),
  newStatus: varchar("newStatus", { length: 100 }),
  reviewerUserId: int("reviewerUserId"),
  reviewNote: text("reviewNote"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type FarDfarsReviewEvent = typeof farDfarsReviewEvents.$inferSelect;
export type InsertFarDfarsReviewEvent = typeof farDfarsReviewEvents.$inferInsert;

// Saved filter views
export const farDfarsSavedViews = mysqlTable("far_dfars_saved_views", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  filters: text("filters").notNull(),
  isDefault: boolean("isDefault").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type FarDfarsSavedView = typeof farDfarsSavedViews.$inferSelect;
export type InsertFarDfarsSavedView = typeof farDfarsSavedViews.$inferInsert;

// Clause lifecycle tracking per workspace
export const farDfarsClauseLifecycle = mysqlTable("far_dfars_clause_lifecycle", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  clauseId: int("clauseId").notNull(),
  lifecycleStatus: varchar("lifecycleStatus", { length: 50 }).default("reference_only"),
  lastReviewedAt: timestamp("lastReviewedAt"),
  lastReviewedBy: int("lastReviewedBy"),
  contractSourceLastAnalyzed: timestamp("contractSourceLastAnalyzed"),
  isStale: boolean("isStale").default(false),
  staleReason: text("staleReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FarDfarsClauseLifecycle = typeof farDfarsClauseLifecycle.$inferSelect;
export type InsertFarDfarsClauseLifecycle = typeof farDfarsClauseLifecycle.$inferInsert;

// Clause exports
export const farDfarsExports = mysqlTable("far_dfars_exports", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  exportType: varchar("exportType", { length: 100 }).notNull(),
  filtersUsed: text("filtersUsed"),
  createdBy: int("createdBy"),
  fileUrl: text("fileUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type FarDfarsExport = typeof farDfarsExports.$inferSelect;
export type InsertFarDfarsExport = typeof farDfarsExports.$inferInsert;

// Checkout Sessions — track Stripe checkout sessions through the billing flow
export const checkoutSessions = mysqlTable("checkout_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  workspaceId: int("workspaceId"), // nullable — workspace may not exist yet at checkout start
  planId: int("planId").notNull(),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "completed", "expired", "canceled"]).default("pending").notNull(),
  billingInterval: mysqlEnum("billingInterval", ["month", "year"]).default("month").notNull(),
  completedAt: timestamp("completedAt"),
  canceledAt: timestamp("canceledAt"),
  metadata: text("metadata"), // JSON for extra context
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CheckoutSession = typeof checkoutSessions.$inferSelect;
export type InsertCheckoutSession = typeof checkoutSessions.$inferInsert;

// ==================== INVOICE LINE ITEMS ====================
export const invoiceLineItems = mysqlTable("invoice_line_items", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 12, scale: 4 }).default("1"),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertInvoiceLineItem = typeof invoiceLineItems.$inferInsert;

// ==================== INVOICE CHECKLIST ITEMS ====================
export const invoiceChecklistItems = mysqlTable("invoice_checklist_items", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  required: boolean("required").default(true),
  completed: boolean("completed").default(false),
  completedBy: int("completedBy"),
  completedAt: timestamp("completedAt"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type InvoiceChecklistItem = typeof invoiceChecklistItems.$inferSelect;
export type InsertInvoiceChecklistItem = typeof invoiceChecklistItems.$inferInsert;

// ==================== INVOICE ISSUES / DISPUTES ====================
export const invoiceIssues = mysqlTable("invoice_issues", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open"),
  resolution: text("resolution"),
  raisedBy: int("raisedBy"),
  resolvedBy: int("resolvedBy"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type InvoiceIssue = typeof invoiceIssues.$inferSelect;
export type InsertInvoiceIssue = typeof invoiceIssues.$inferInsert;

// ==================== PAYMENT APPLICATIONS ====================
export const paymentApplications = mysqlTable("payment_applications", {
  id: int("id").autoincrement().primaryKey(),
  paymentId: int("paymentId").notNull(),
  invoiceId: int("invoiceId").notNull(),
  workspaceId: int("workspaceId").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PaymentApplication = typeof paymentApplications.$inferSelect;
export type InsertPaymentApplication = typeof paymentApplications.$inferInsert;

// Closeout Evidence — links files/documents to closeout items or blockers
export const closeoutEvidence = mysqlTable("closeout_evidence", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspaceId").notNull(),
  closeoutId: int("closeoutId").notNull(),
  linkedItemType: varchar("linkedItemType", { length: 50 }).notNull(), // "checklist_item" or "blocker"
  linkedItemId: int("linkedItemId").notNull(),
  fileId: int("fileId"),
  title: varchar("title", { length: 255 }).notNull(),
  url: text("url"),
  description: text("description"),
  uploadedBy: int("uploadedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CloseoutEvidence = typeof closeoutEvidence.$inferSelect;
export type InsertCloseoutEvidence = typeof closeoutEvidence.$inferInsert;

// ==================== PHASE 6: PLATFORM PAGES ====================

// Launch Readiness Items — Persisted checklist for platform launch readiness
export const launchReadinessItems = mysqlTable("launch_readiness_items", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "passed", "failed", "blocked"]).default("not_started").notNull(),
  owner: varchar("owner", { length: 255 }),
  notes: text("notes"),
  lastCheckedAt: timestamp("lastCheckedAt"),
  relatedRoute: varchar("relatedRoute", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LaunchReadinessItem = typeof launchReadinessItems.$inferSelect;
export type InsertLaunchReadinessItem = typeof launchReadinessItems.$inferInsert;

// Notification Templates — Platform-wide notification/email templates
export const notificationTemplates = mysqlTable("notification_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // welcome, billing_success, billing_failure, support_ticket_update, invite_member, deadline_reminder, invoice_reminder, contract_alert, closeout_alert
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type InsertNotificationTemplate = typeof notificationTemplates.$inferInsert;

// Integration Test Results — Store results of platform integration tests
export const integrationTestResults = mysqlTable("integration_test_results", {
  id: int("id").autoincrement().primaryKey(),
  integrationName: varchar("integrationName", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["pass", "fail", "warning", "untested"]).default("untested").notNull(),
  message: text("message"),
  testedAt: timestamp("testedAt").defaultNow().notNull(),
  testedBy: int("testedBy"),
});
export type IntegrationTestResult = typeof integrationTestResults.$inferSelect;
export type InsertIntegrationTestResult = typeof integrationTestResults.$inferInsert;

// Opportunity Import Runs - Tracks bulk and individual import operations
export const opportunityImportRuns = mysqlTable("opportunity_import_runs", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  runType: varchar("runType", { length: 50 }).notNull().default("single"), // single, bulk, url
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, running, completed, failed
  totalItems: int("totalItems").default(0),
  importedCount: int("importedCount").default(0),
  skippedCount: int("skippedCount").default(0),
  failedCount: int("failedCount").default(0),
  duplicateCount: int("duplicateCount").default(0),
  searchQuery: text("searchQuery"),
  sourceUrl: text("sourceUrl"),
  errorSummary: text("errorSummary"),
  importedOpportunityIds: json("importedOpportunityIds"),
  triggeredAiReview: boolean("triggeredAiReview").default(false),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  importedBy: int("importedBy"),
});
export type OpportunityImportRun = typeof opportunityImportRuns.$inferSelect;
export type InsertOpportunityImportRun = typeof opportunityImportRuns.$inferInsert;

// ==================== PHASE 35: GUIDED AI EXPERIENCE TABLES ====================

// Contextual Help Items — page-specific help content
export const contextualHelpItems = mysqlTable("contextual_help_items", {
  id: int("id").autoincrement().primaryKey(),
  pageKey: varchar("pageKey", { length: 100 }).notNull(),
  sectionKey: varchar("sectionKey", { length: 100 }),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  helpArticleSlug: varchar("helpArticleSlug", { length: 255 }),
  glossaryTermSlug: varchar("glossaryTermSlug", { length: 255 }),
  audience: mysqlEnum("audience", ["public", "customer", "platform_owner", "all"]).default("customer").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ContextualHelpItem = typeof contextualHelpItems.$inferSelect;
export type InsertContextualHelpItem = typeof contextualHelpItems.$inferInsert;

// Lifecycle Status History — audit trail for all status changes
export const lifecycleStatusHistory = mysqlTable("lifecycle_status_history", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  recordType: varchar("recordType", { length: 64 }).notNull(),
  recordId: int("recordId").notNull(),
  previousStatus: varchar("previousStatus", { length: 50 }),
  newStatus: varchar("newStatus", { length: 50 }).notNull(),
  reason: text("reason"),
  changedBy: int("changedBy"),
  changedAt: timestamp("changedAt").defaultNow().notNull(),
});
export type LifecycleStatusHistory = typeof lifecycleStatusHistory.$inferSelect;
export type InsertLifecycleStatusHistory = typeof lifecycleStatusHistory.$inferInsert;

// Auto-Population Events — track when fields are auto-filled
export const autoPopulationEvents = mysqlTable("auto_population_events", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  targetRecordType: varchar("targetRecordType", { length: 64 }).notNull(),
  targetRecordId: int("targetRecordId").notNull(),
  sourceRecordType: varchar("sourceRecordType", { length: 64 }).notNull(),
  sourceRecordId: int("sourceRecordId").notNull(),
  fieldsApplied: json("fieldsApplied"),
  fieldsSkipped: json("fieldsSkipped"),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AutoPopulationEvent = typeof autoPopulationEvents.$inferSelect;
export type InsertAutoPopulationEvent = typeof autoPopulationEvents.$inferInsert;

// Source References — link records to their source documents/files
export const sourceReferences = mysqlTable("source_references", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  relatedRecordType: varchar("relatedRecordType", { length: 64 }).notNull(),
  relatedRecordId: int("relatedRecordId").notNull(),
  sourceType: varchar("sourceType", { length: 100 }).notNull(),
  sourceFileId: int("sourceFileId"),
  sourceUrl: text("sourceUrl"),
  sourceLocation: varchar("sourceLocation", { length: 500 }),
  excerpt: text("excerpt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SourceReference = typeof sourceReferences.$inferSelect;
export type InsertSourceReference = typeof sourceReferences.$inferInsert;

// Template Improvement Suggestions — suggestions from lessons learned
export const templateImprovementSuggestions = mysqlTable("template_improvement_suggestions", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  templateType: varchar("templateType", { length: 100 }).notNull(),
  sourceLessonId: int("sourceLessonId"),
  title: varchar("title", { length: 255 }).notNull(),
  recommendation: text("recommendation").notNull(),
  status: mysqlEnum("status", ["new", "accepted", "rejected", "applied"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TemplateImprovementSuggestion = typeof templateImprovementSuggestions.$inferSelect;
export type InsertTemplateImprovementSuggestion = typeof templateImprovementSuggestions.$inferInsert;

// Help Articles — real help center content
export const helpArticles = mysqlTable("help_articles", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  category: varchar("category", { length: 100 }),
  relatedGlossaryTerms: text("relatedGlossaryTerms"),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HelpArticle = typeof helpArticles.$inferSelect;
export type InsertHelpArticle = typeof helpArticles.$inferInsert;

// Glossary Terms — government contracting terminology
export const glossaryTerms = mysqlTable("glossary_terms", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  term: varchar("term", { length: 255 }).notNull(),
  definition: text("definition").notNull(),
  whereInApp: text("whereInApp"),
  relatedPages: text("relatedPages"),
  relatedHelpArticles: text("relatedHelpArticles"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GlossaryTerm = typeof glossaryTerms.$inferSelect;
export type InsertGlossaryTerm = typeof glossaryTerms.$inferInsert;

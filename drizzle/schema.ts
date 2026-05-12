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
  solicitation: varchar("solicitation", { length: 255 }),
  naics: varchar("naics", { length: 50 }),
  setAside: varchar("setAside", { length: 100 }),
  dueDate: timestamp("dueDate"),
  type: varchar("type", { length: 100 }),
  sourceLink: text("sourceLink"),
  summary: text("summary"),
  status: mysqlEnum("status", ["new", "in_review", "pursue", "hold", "no_pursue", "moved_to_proposal", "archived"]).default("new"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deletedAt"),
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
  linkedRecordType: varchar("linkedRecordType", { length: 50 }), // "opportunity", "proposal", "contract"
  linkedRecordId: int("linkedRecordId"),
  category: varchar("category", { length: 100 }), // "governing", "supporting", "deliverable", "correspondence"
  uploadedBy: int("uploadedBy"),
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
  status: mysqlEnum("status", ["draft", "submitted", "approved", "paid", "rejected", "overdue"]).default("draft"),
  issuedDate: timestamp("issuedDate"),
  dueDate: timestamp("dueDate"),
  paidDate: timestamp("paidDate"),
  description: text("description"),
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
  description: text("description"),
  impact: mysqlEnum("impact", ["positive", "negative", "neutral"]).default("neutral"),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  rootCause: text("rootCause"),
  recommendation: text("recommendation"),
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
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  status: mysqlEnum("status", ["open", "in_progress", "waiting_on_customer", "resolved", "closed"]).default("open"),
  assignedTo: varchar("assignedTo", { length: 255 }),
  resolution: text("resolution"),
  resolvedAt: timestamp("resolvedAt"),
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
  role: mysqlEnum("role", ["owner", "admin", "member", "viewer"]).default("member").notNull(),
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
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  completedBy: int("completedBy"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
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
  targetType: mysqlEnum("targetType", ["workspace", "user", "plan", "billing"]).notNull(),
  targetId: int("targetId").notNull(),
  performedBy: int("performedBy").notNull(),
  reason: text("reason"),
  metadata: text("metadata"), // JSON with additional context
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PlatformAuditLogEntry = typeof platformAuditLog.$inferSelect;
export type InsertPlatformAuditLogEntry = typeof platformAuditLog.$inferInsert;

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

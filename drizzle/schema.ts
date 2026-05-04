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

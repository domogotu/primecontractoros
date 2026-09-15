/**
 * Guidance Question Engine - The CORE differentiator
 * Generates and evaluates 70,000+ guidance questions using:
 * GUIDANCE WORD × 6 DIMENSIONS (Who/What/When/Where/Why/How) × ANSWER OUTCOME FAMILIES
 */
import { getDb, getInsertId } from "../db";
import { guidanceQuestions, guidanceQuestionDismissals } from "../../drizzle/schema";
import { eq, and, inArray, notInArray } from "drizzle-orm";

// Page contexts for the system
export const PAGE_CONTEXTS = [
  "onboarding", "business_profile", "opportunities", "opportunity_detail",
  "proposals", "proposal_workspace", "contracts", "contract_hub",
  "ai_confirmation", "files", "contacts", "invoices", "payments",
  "deliverables", "deadlines", "compliance", "closeout", "lessons_learned"
] as const;

export type PageContext = typeof PAGE_CONTEXTS[number];

// Categories for guidance questions
export const CATEGORIES = [
  "Authority", "Scope", "Funding", "Compliance", "Evidence", "Risk",
  "Workflow", "Contract", "Proposal", "Invoice", "Payment", "Deliverable",
  "Deadline", "Obligation", "Modification", "Closeout", "Admin",
  "Legal Sensitivity", "Documentation", "Communication"
] as const;

export type Category = typeof CATEGORIES[number];

// Dimensions
export const DIMENSIONS = ["who", "what", "when", "where", "why", "how"] as const;
export type Dimension = typeof DIMENSIONS[number];

// Answer outcome families
export const OUTCOME_FAMILIES = [
  "authority", "scope", "funding", "compliance", "evidence", "review", "risk", "consequence"
] as const;
export type OutcomeFamily = typeof OUTCOME_FAMILIES[number];

// Guidance words per page context
const GUIDANCE_WORDS: Record<string, string[]> = {
  onboarding: ["register", "verify", "configure", "certify", "validate", "setup", "profile", "capability", "naics", "sam"],
  business_profile: ["update", "verify", "certify", "maintain", "document", "register", "validate", "capability", "past_performance", "differentiate"],
  opportunities: ["identify", "evaluate", "qualify", "pursue", "track", "research", "analyze", "prioritize", "source", "monitor"],
  opportunity_detail: ["review", "assess", "qualify", "decide", "prepare", "research", "validate", "team", "price", "submit"],
  proposals: ["plan", "write", "review", "submit", "comply", "price", "team", "manage", "track", "quality"],
  proposal_workspace: ["draft", "edit", "review", "format", "comply", "reference", "cite", "validate", "collaborate", "finalize"],
  contracts: ["execute", "manage", "modify", "comply", "deliver", "invoice", "report", "close", "monitor", "renew"],
  contract_hub: ["monitor", "track", "report", "manage", "comply", "deliver", "invoice", "communicate", "escalate", "document"],
  ai_confirmation: ["confirm", "review", "validate", "approve", "reject", "modify", "understand", "implement", "track", "document"],
  files: ["upload", "classify", "version", "share", "protect", "organize", "review", "archive", "link", "search"],
  contacts: ["add", "update", "categorize", "communicate", "assign", "track", "verify", "link", "manage", "remove"],
  invoices: ["create", "submit", "track", "reconcile", "dispute", "approve", "pay", "document", "comply", "report"],
  payments: ["receive", "verify", "reconcile", "track", "report", "dispute", "allocate", "document", "comply", "forecast"],
  deliverables: ["plan", "create", "submit", "track", "review", "approve", "reject", "revise", "document", "close"],
  deadlines: ["identify", "track", "prioritize", "meet", "extend", "escalate", "communicate", "plan", "buffer", "report"],
  compliance: ["identify", "implement", "monitor", "report", "correct", "document", "train", "audit", "certify", "update"],
  closeout: ["plan", "verify", "document", "submit", "reconcile", "archive", "report", "certify", "transfer", "complete"],
  lessons_learned: ["capture", "analyze", "categorize", "share", "implement", "track", "review", "improve", "document", "apply"],
};

// Check evaluation logic
interface CheckResult {
  check: string;
  passed: boolean;
  message: string;
  severity: "info" | "warning" | "error";
}

interface EvaluationResult {
  checks: CheckResult[];
  overallStatus: "pass" | "warning" | "fail";
  nextBestAction: string;
  systemAction: string;
}

interface QuestionResult {
  id: number;
  guidanceWord: string;
  category: string;
  dimension: string;
  questionText: string;
  checks: CheckResult[];
  nextBestAction: string | null;
  systemAction: string | null;
  priority: string;
}

export class GuidanceQuestionEngine {
  /**
   * Get relevant questions for a page context and record state
   */
  async getQuestionsForPage(params: {
    pageContext: string;
    workspaceId: number;
    userId: number;
    recordType?: string;
    recordId?: number;
    limit?: number;
  }): Promise<QuestionResult[]> {
    const db = await getDb();
    if (!db) return this.generateInMemoryQuestions(params.pageContext, params.recordType);

    // Get dismissed question IDs for this user
    const dismissed = await db.select({ questionId: guidanceQuestionDismissals.questionId })
      .from(guidanceQuestionDismissals)
      .where(and(
        eq(guidanceQuestionDismissals.workspaceId, params.workspaceId),
        eq(guidanceQuestionDismissals.userId, params.userId)
      ));
    const dismissedIds = dismissed.map(d => d.questionId);

    // Get questions for this page context
    let questions;
    if (dismissedIds.length > 0) {
      questions = await db.select().from(guidanceQuestions)
        .where(and(
          eq(guidanceQuestions.pageContext, params.pageContext),
          eq(guidanceQuestions.isActive, true),
          notInArray(guidanceQuestions.id, dismissedIds)
        ))
        .limit(params.limit || 5);
    } else {
      questions = await db.select().from(guidanceQuestions)
        .where(and(
          eq(guidanceQuestions.pageContext, params.pageContext),
          eq(guidanceQuestions.isActive, true)
        ))
        .limit(params.limit || 5);
    }

    if (questions.length === 0) {
      return this.generateInMemoryQuestions(params.pageContext, params.recordType);
    }

    return questions.map(q => ({
      id: q.id,
      guidanceWord: q.guidanceWord,
      category: q.category,
      dimension: this.inferDimension(q),
      questionText: this.buildQuestionText(q),
      checks: this.evaluateChecks(q),
      nextBestAction: q.nextBestAction,
      systemAction: q.systemAction,
      priority: q.priority || "medium",
    }));
  }

  /**
   * Evaluate a record against guidance checks
   */
  async evaluateRecord(params: {
    pageContext: string;
    workspaceId: number;
    recordType: string;
    recordId: number;
    recordData: Record<string, unknown>;
  }): Promise<EvaluationResult> {
    const checks: CheckResult[] = [];

    // Authority check
    if (params.recordData.assignedTo || params.recordData.createdBy) {
      checks.push({
        check: "authority",
        passed: true,
        message: "Record has an assigned authority/owner",
        severity: "info"
      });
    } else {
      checks.push({
        check: "authority",
        passed: false,
        message: "No authority assigned - who is responsible?",
        severity: "warning"
      });
    }

    // Scope check
    if (params.recordData.description || params.recordData.summary || params.recordData.title) {
      checks.push({
        check: "scope",
        passed: true,
        message: "Record scope is defined",
        severity: "info"
      });
    } else {
      checks.push({
        check: "scope",
        passed: false,
        message: "Scope not clearly defined",
        severity: "warning"
      });
    }

    // Funding check (relevant for contracts, invoices, proposals)
    if (["contract", "invoice", "proposal", "payment"].includes(params.recordType)) {
      if (params.recordData.value || params.recordData.amount || params.recordData.budget) {
        checks.push({
          check: "funding",
          passed: true,
          message: "Financial values are specified",
          severity: "info"
        });
      } else {
        checks.push({
          check: "funding",
          passed: false,
          message: "No financial values specified - funding unclear",
          severity: "error"
        });
      }
    }

    // Compliance check
    if (params.recordData.complianceStatus || params.recordData.farClauses) {
      checks.push({
        check: "compliance",
        passed: true,
        message: "Compliance requirements addressed",
        severity: "info"
      });
    } else if (["contract", "proposal"].includes(params.recordType)) {
      checks.push({
        check: "compliance",
        passed: false,
        message: "No compliance requirements documented",
        severity: "warning"
      });
    }

    // Evidence check
    if (params.recordData.files || params.recordData.documents || params.recordData.attachments) {
      checks.push({
        check: "evidence",
        passed: true,
        message: "Supporting evidence/documents attached",
        severity: "info"
      });
    } else {
      checks.push({
        check: "evidence",
        passed: false,
        message: "No supporting documents attached",
        severity: "info"
      });
    }

    // Risk check
    if (params.recordData.dueDate) {
      const dueDate = new Date(params.recordData.dueDate as string);
      const now = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue < 0) {
        checks.push({
          check: "risk",
          passed: false,
          message: `Overdue by ${Math.abs(daysUntilDue)} days`,
          severity: "error"
        });
      } else if (daysUntilDue < 7) {
        checks.push({
          check: "risk",
          passed: false,
          message: `Due in ${daysUntilDue} days - high urgency`,
          severity: "warning"
        });
      } else {
        checks.push({
          check: "risk",
          passed: true,
          message: `Due in ${daysUntilDue} days`,
          severity: "info"
        });
      }
    }

    const failedChecks = checks.filter(c => !c.passed);
    const errorChecks = checks.filter(c => c.severity === "error" && !c.passed);

    let overallStatus: "pass" | "warning" | "fail" = "pass";
    if (errorChecks.length > 0) overallStatus = "fail";
    else if (failedChecks.length > 0) overallStatus = "warning";

    const nextBestAction = this.determineNextAction(checks, params.recordType, params.recordData);
    const systemAction = this.determineSystemAction(checks, params.recordType);

    return { checks, overallStatus, nextBestAction, systemAction };
  }

  /**
   * Get the single most important next action
   */
  async getNextBestAction(params: {
    pageContext: string;
    workspaceId: number;
    recordType?: string;
    recordData?: Record<string, unknown>;
  }): Promise<{ action: string; reason: string; priority: string }> {
    const recordData = params.recordData || {};
    const recordType = params.recordType || "general";

    const evaluation = await this.evaluateRecord({
      pageContext: params.pageContext,
      workspaceId: params.workspaceId,
      recordType,
      recordId: 0,
      recordData,
    });

    return {
      action: evaluation.nextBestAction,
      reason: evaluation.checks.find(c => !c.passed)?.message || "All checks passing",
      priority: evaluation.overallStatus === "fail" ? "critical" : evaluation.overallStatus === "warning" ? "high" : "medium",
    };
  }

  /**
   * Dismiss a question for a user
   */
  async dismissQuestion(params: { workspaceId: number; userId: number; questionId: number }): Promise<void> {
    const db = await getDb();
    if (!db) return;
    await db.insert(guidanceQuestionDismissals).values({
      workspaceId: params.workspaceId,
      userId: params.userId,
      questionId: params.questionId,
    });
  }

  /**
   * Convert a guidance question to a task
   */
  async convertToTask(params: {
    workspaceId: number;
    userId: number;
    questionId: number;
    title: string;
    description: string;
  }): Promise<{ taskId: number }> {
    const db = await getDb();
    if (!db) return { taskId: 0 };

    const { tasks } = await import("../../drizzle/schema");
    const [result] = await db.insert(tasks).values({
      workspaceId: params.workspaceId,
      title: params.title,
      description: params.description,
      priority: "medium",
      status: "todo",
    }).$returningId();

    return { taskId: result.id };
  }

  // Private helpers

  private generateInMemoryQuestions(pageContext: string, recordType?: string): QuestionResult[] {
    const words = GUIDANCE_WORDS[pageContext] || GUIDANCE_WORDS.opportunities;
    const results: QuestionResult[] = [];

    // Generate top 5 most relevant questions
    const relevantWords = words.slice(0, 5);
    let id = -1;

    for (const word of relevantWords) {
      const dimension = DIMENSIONS[Math.abs(id) % DIMENSIONS.length];
      const category = this.getCategoryForWord(word, pageContext);

      results.push({
        id: id--,
        guidanceWord: word,
        category,
        dimension,
        questionText: this.generateQuestionText(word, dimension, category, pageContext),
        checks: this.getDefaultChecks(word, pageContext),
        nextBestAction: this.getDefaultNextAction(word, pageContext),
        systemAction: this.getDefaultSystemAction(word, pageContext),
        priority: this.getDefaultPriority(word, pageContext),
      });
    }

    return results;
  }

  private inferDimension(q: { who: string | null; what: string | null; whenField: string | null; whereField: string | null; why: string | null; how: string | null }): string {
    if (q.who) return "who";
    if (q.what) return "what";
    if (q.whenField) return "when";
    if (q.whereField) return "where";
    if (q.why) return "why";
    if (q.how) return "how";
    return "what";
  }

  private buildQuestionText(q: { guidanceWord: string; who: string | null; what: string | null; whenField: string | null; whereField: string | null; why: string | null; how: string | null; category: string }): string {
    if (q.who) return q.who;
    if (q.what) return q.what;
    if (q.whenField) return q.whenField;
    if (q.whereField) return q.whereField;
    if (q.why) return q.why;
    if (q.how) return q.how;
    return `${q.category}: How should you ${q.guidanceWord}?`;
  }

  private evaluateChecks(q: { authorityCheck: string | null; scopeCheck: string | null; fundingCheck: string | null; complianceCheck: string | null; evidenceCheck: string | null; reviewCheck: string | null; riskCheck: string | null; consequenceCheck: string | null }): CheckResult[] {
    const checks: CheckResult[] = [];
    if (q.authorityCheck) checks.push({ check: "authority", passed: true, message: q.authorityCheck, severity: "info" });
    if (q.scopeCheck) checks.push({ check: "scope", passed: true, message: q.scopeCheck, severity: "info" });
    if (q.fundingCheck) checks.push({ check: "funding", passed: true, message: q.fundingCheck, severity: "info" });
    if (q.complianceCheck) checks.push({ check: "compliance", passed: true, message: q.complianceCheck, severity: "info" });
    if (q.evidenceCheck) checks.push({ check: "evidence", passed: true, message: q.evidenceCheck, severity: "info" });
    if (q.reviewCheck) checks.push({ check: "review", passed: true, message: q.reviewCheck, severity: "info" });
    if (q.riskCheck) checks.push({ check: "risk", passed: true, message: q.riskCheck, severity: "warning" });
    if (q.consequenceCheck) checks.push({ check: "consequence", passed: true, message: q.consequenceCheck, severity: "warning" });
    return checks.length > 0 ? checks : [{ check: "general", passed: true, message: "Review recommended", severity: "info" }];
  }

  private determineNextAction(checks: CheckResult[], recordType: string, recordData: Record<string, unknown>): string {
    const errors = checks.filter(c => c.severity === "error" && !c.passed);
    if (errors.length > 0) return `Fix critical issue: ${errors[0].message}`;

    const warnings = checks.filter(c => c.severity === "warning" && !c.passed);
    if (warnings.length > 0) return `Address warning: ${warnings[0].message}`;

    if (!recordData.description && !recordData.summary) return "Add description or summary to this record";
    if (!recordData.dueDate) return "Set a due date for tracking";

    return "Record is in good shape - continue monitoring";
  }

  private determineSystemAction(checks: CheckResult[], recordType: string): string {
    const errors = checks.filter(c => c.severity === "error" && !c.passed);
    if (errors.length > 0) return "create_alert";

    const warnings = checks.filter(c => c.severity === "warning" && !c.passed);
    if (warnings.length > 0) return "create_task";

    return "no_action";
  }

  private getCategoryForWord(word: string, pageContext: string): string {
    const categoryMap: Record<string, string> = {
      register: "Admin", verify: "Compliance", configure: "Admin", certify: "Compliance",
      validate: "Evidence", setup: "Admin", profile: "Admin", capability: "Scope",
      naics: "Scope", sam: "Admin", update: "Admin", maintain: "Admin",
      document: "Documentation", identify: "Scope", evaluate: "Risk", qualify: "Authority",
      pursue: "Scope", track: "Workflow", research: "Evidence", analyze: "Risk",
      prioritize: "Workflow", source: "Scope", monitor: "Risk", review: "Evidence",
      assess: "Risk", decide: "Authority", prepare: "Workflow", team: "Authority",
      price: "Funding", submit: "Workflow", plan: "Workflow", write: "Documentation",
      comply: "Compliance", manage: "Workflow", quality: "Compliance", draft: "Documentation",
      edit: "Documentation", format: "Documentation", reference: "Evidence", cite: "Evidence",
      collaborate: "Communication", finalize: "Workflow", execute: "Contract", modify: "Modification",
      deliver: "Deliverable", invoice: "Invoice", report: "Documentation", close: "Closeout",
      renew: "Contract", communicate: "Communication", escalate: "Risk", confirm: "Authority",
      approve: "Authority", reject: "Authority", understand: "Compliance", implement: "Workflow",
      upload: "Documentation", classify: "Admin", version: "Documentation", share: "Communication",
      protect: "Legal Sensitivity", organize: "Admin", archive: "Closeout", link: "Workflow",
      search: "Workflow", add: "Admin", categorize: "Admin", assign: "Authority",
      remove: "Admin", create: "Workflow", reconcile: "Funding", dispute: "Risk",
      pay: "Payment", forecast: "Funding", receive: "Payment", allocate: "Funding",
      extend: "Deadline", buffer: "Risk", meet: "Deadline", correct: "Compliance",
      train: "Compliance", audit: "Compliance", transfer: "Closeout", complete: "Closeout",
      capture: "Documentation", improve: "Workflow", apply: "Workflow",
    };
    return categoryMap[word] || "Workflow";
  }

  private generateQuestionText(word: string, dimension: string, category: string, pageContext: string): string {
    const templates: Record<string, Record<string, string>> = {
      who: {
        default: `Who is responsible for the "${word}" action in this ${category.toLowerCase()} context?`,
        Authority: `Who has the authority to ${word} this record?`,
        Compliance: `Who is accountable for ensuring ${word} compliance?`,
      },
      what: {
        default: `What specific items need to be ${word}ed for this ${pageContext.replace(/_/g, " ")}?`,
        Scope: `What is the scope of what needs to be ${word}ed?`,
        Evidence: `What evidence is needed to confirm ${word} was completed?`,
      },
      when: {
        default: `When must the "${word}" action be completed?`,
        Deadline: `When is the deadline for ${word}ing this item?`,
        Risk: `When does the risk of not ${word}ing become critical?`,
      },
      where: {
        default: `Where should the ${word} action be documented?`,
        Documentation: `Where is the ${word} documentation stored?`,
        Communication: `Where should ${word} communications be directed?`,
      },
      why: {
        default: `Why is it important to ${word} at this stage?`,
        Compliance: `Why is ${word}ing required for compliance?`,
        Risk: `Why does failing to ${word} create risk?`,
      },
      how: {
        default: `How should you ${word} in this ${pageContext.replace(/_/g, " ")} context?`,
        Workflow: `How does the ${word} process work step by step?`,
        Funding: `How does ${word}ing affect the financial position?`,
      },
    };

    const dimTemplates = templates[dimension] || templates.what;
    return dimTemplates[category] || dimTemplates.default;
  }

  private getDefaultChecks(word: string, pageContext: string): CheckResult[] {
    return [
      { check: "authority", passed: false, message: `Verify who can ${word}`, severity: "warning" },
      { check: "scope", passed: false, message: `Define scope of ${word} action`, severity: "info" },
      { check: "evidence", passed: false, message: `Document evidence of ${word}`, severity: "info" },
    ];
  }

  private getDefaultNextAction(word: string, pageContext: string): string {
    return `Complete the "${word}" action for this ${pageContext.replace(/_/g, " ")} record`;
  }

  private getDefaultSystemAction(word: string, pageContext: string): string {
    return "create_task";
  }

  private getDefaultPriority(word: string, pageContext: string): string {
    const highPriorityWords = ["submit", "comply", "approve", "pay", "deliver", "close", "certify"];
    if (highPriorityWords.includes(word)) return "high";
    return "medium";
  }
}

// Singleton instance
export const guidanceQuestionEngine = new GuidanceQuestionEngine();

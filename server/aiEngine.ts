/**
 * AI Engine — Workflow-specific AI tools for PrimeContractorOS
 * 
 * Core rules:
 * - AI reads, organizes, compares, and suggests
 * - The user reviews and approves
 * - The app tracks the approved work
 * - AI does NOT make final legal conclusions, declare compliance, override user review,
 *   or silently create official contract obligations without approval
 */

import { invokeLLM } from "./_core/llm";
import { getDb, getInsertId } from "./db";
import { aiRuns, aiFindings, aiSuggestions, aiUsageLogs, aiExtractedObligations } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// ============================================================
// Types
// ============================================================

export interface AiRunContext {
  workspaceId: number;
  userId: number;
  recordType: string;
  recordId?: number;
  runType: string;
}

export interface AiEngineResult {
  runId: number;
  success: boolean;
  findings?: any[];
  suggestions?: any[];
  obligations?: any[];
  error?: string;
  usage?: { inputTokens: number; outputTokens: number; estimatedCost: number };
}

// ============================================================
// Structured Output Schemas
// ============================================================

const contractScanSchema = {
  name: "contract_scan_results",
  strict: true,
  schema: {
    type: "object",
    properties: {
      findings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            category: { type: "string", enum: ["requirement", "deliverable", "deadline", "billing_term", "compliance", "risk", "missing_info", "flowdown"] },
            title: { type: "string", description: "Short title of the finding" },
            sourceLocation: { type: "string", description: "Section/page reference in the document" },
            sourceExcerpt: { type: "string", description: "Exact quote from the source" },
            plainLanguageMeaning: { type: "string", description: "What this means in plain language" },
            practicalMeaning: { type: "string", description: "What the contractor must do" },
            confidenceScore: { type: "number", description: "0.0 to 1.0 confidence" },
            riskLevel: { type: "string", enum: ["low", "medium", "high", "critical"] },
          },
          required: ["category", "title", "sourceLocation", "sourceExcerpt", "plainLanguageMeaning", "practicalMeaning", "confidenceScore", "riskLevel"],
          additionalProperties: false,
        },
      },
      obligations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            obligationType: { type: "string", enum: ["requirement", "deliverable", "deadline", "compliance_item", "task", "alert"] },
            title: { type: "string" },
            description: { type: "string" },
            dueDate: { type: ["string", "null"], description: "ISO date string or null" },
            recurrence: { type: ["string", "null"], enum: ["once", "monthly", "quarterly", "annually", null] },
            evidenceNeeded: { type: ["string", "null"] },
            suggestedOwner: { type: ["string", "null"] },
          },
          required: ["obligationType", "title", "description", "dueDate", "recurrence", "evidenceNeeded", "suggestedOwner"],
          additionalProperties: false,
        },
      },
      summary: { type: "string", description: "Brief overall summary of the scan" },
    },
    required: ["findings", "obligations", "summary"],
    additionalProperties: false,
  },
};

const opportunityReviewSchema = {
  name: "opportunity_review_results",
  strict: true,
  schema: {
    type: "object",
    properties: {
      recommendation: { type: "string", enum: ["pursue", "hold", "no_pursue"] },
      reasoning: { type: "string" },
      missingInfo: {
        type: "array",
        items: { type: "string" },
      },
      strengths: {
        type: "array",
        items: { type: "string" },
      },
      risks: {
        type: "array",
        items: { type: "string" },
      },
      suggestions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            explanation: { type: "string" },
            recommendedAction: { type: "string" },
            priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
          },
          required: ["title", "explanation", "recommendedAction", "priority"],
          additionalProperties: false,
        },
      },
    },
    required: ["recommendation", "reasoning", "missingInfo", "strengths", "risks", "suggestions"],
    additionalProperties: false,
  },
};

const proposalReviewSchema = {
  name: "proposal_review_results",
  strict: true,
  schema: {
    type: "object",
    properties: {
      readinessScore: { type: "number", description: "0-100 readiness score" },
      readinessLevel: { type: "string", enum: ["not_ready", "needs_work", "nearly_ready", "ready"] },
      missingElements: {
        type: "array",
        items: { type: "string" },
      },
      complianceMatrix: {
        type: "array",
        items: {
          type: "object",
          properties: {
            requirement: { type: "string" },
            status: { type: "string", enum: ["met", "partially_met", "not_met", "unclear"] },
            evidence: { type: "string" },
          },
          required: ["requirement", "status", "evidence"],
          additionalProperties: false,
        },
      },
      suggestions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            explanation: { type: "string" },
            recommendedAction: { type: "string" },
            priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
          },
          required: ["title", "explanation", "recommendedAction", "priority"],
          additionalProperties: false,
        },
      },
      overallAssessment: { type: "string" },
    },
    required: ["readinessScore", "readinessLevel", "missingElements", "complianceMatrix", "suggestions", "overallAssessment"],
    additionalProperties: false,
  },
};

const fileScanSchema = {
  name: "file_scan_results",
  strict: true,
  schema: {
    type: "object",
    properties: {
      documentType: { type: "string", description: "Type of document detected" },
      summary: { type: "string", description: "Brief summary of the document" },
      findings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            category: { type: "string", enum: ["requirement", "deliverable", "deadline", "billing_term", "compliance", "risk", "missing_info", "flowdown"] },
            title: { type: "string" },
            sourceLocation: { type: "string" },
            sourceExcerpt: { type: "string" },
            plainLanguageMeaning: { type: "string" },
            practicalMeaning: { type: "string" },
            confidenceScore: { type: "number" },
            riskLevel: { type: "string", enum: ["low", "medium", "high", "critical"] },
          },
          required: ["category", "title", "sourceLocation", "sourceExcerpt", "plainLanguageMeaning", "practicalMeaning", "confidenceScore", "riskLevel"],
          additionalProperties: false,
        },
      },
      deadlines: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            date: { type: ["string", "null"] },
            description: { type: "string" },
          },
          required: ["title", "date", "description"],
          additionalProperties: false,
        },
      },
      requirements: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            sourceLocation: { type: "string" },
          },
          required: ["title", "description", "sourceLocation"],
          additionalProperties: false,
        },
      },
    },
    required: ["documentType", "summary", "findings", "deadlines", "requirements"],
    additionalProperties: false,
  },
};

const invoiceReviewSchema = {
  name: "invoice_review_results",
  strict: true,
  schema: {
    type: "object",
    properties: {
      billingTermsFound: {
        type: "array",
        items: {
          type: "object",
          properties: {
            term: { type: "string" },
            sourceLocation: { type: "string" },
            details: { type: "string" },
          },
          required: ["term", "sourceLocation", "details"],
          additionalProperties: false,
        },
      },
      missingSupport: {
        type: "array",
        items: { type: "string" },
      },
      matchIssues: {
        type: "array",
        items: { type: "string" },
      },
      suggestions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            explanation: { type: "string" },
            recommendedAction: { type: "string" },
            priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
          },
          required: ["title", "explanation", "recommendedAction", "priority"],
          additionalProperties: false,
        },
      },
      overallAssessment: { type: "string" },
    },
    required: ["billingTermsFound", "missingSupport", "matchIssues", "suggestions", "overallAssessment"],
    additionalProperties: false,
  },
};

const workspaceSummarySchema = {
  name: "workspace_summary_results",
  strict: true,
  schema: {
    type: "object",
    properties: {
      overallStatus: { type: "string" },
      needsAttention: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            explanation: { type: "string" },
            recommendedAction: { type: "string" },
            priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
          },
          required: ["title", "explanation", "recommendedAction", "priority"],
          additionalProperties: false,
        },
      },
      suggestedTasks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
            relatedType: { type: ["string", "null"] },
            relatedId: { type: ["number", "null"] },
          },
          required: ["title", "description", "priority", "relatedType", "relatedId"],
          additionalProperties: false,
        },
      },
      keyMetrics: {
        type: "object",
        properties: {
          activeContracts: { type: "number" },
          pendingProposals: { type: "number" },
          overdueItems: { type: "number" },
          unreviewedFindings: { type: "number" },
        },
        required: ["activeContracts", "pendingProposals", "overdueItems", "unreviewedFindings"],
        additionalProperties: false,
      },
    },
    required: ["overallStatus", "needsAttention", "suggestedTasks", "keyMetrics"],
    additionalProperties: false,
  },
};

// ============================================================
// Core Engine Functions
// ============================================================

/** Create an AI run record and return its ID */
async function createRun(ctx: AiRunContext): Promise<number> {
  const [result] = await (await getDb())!.insert(aiRuns).values({
    workspaceId: ctx.workspaceId,
    userId: ctx.userId,
    relatedRecordType: ctx.recordType,
    relatedRecordId: ctx.recordId,
    aiType: ctx.runType.includes("guidance") || ctx.runType.includes("summary") ? "guidance" : "findings",
    runType: ctx.runType,
    status: "processing",
  });
  return getInsertId(result);
}

/** Mark a run as completed */
async function completeRun(runId: number, tokens?: { input: number; output: number }) {
  await (await getDb())!.update(aiRuns).set({
    status: "completed",
    completedAt: new Date(),
    inputTokens: tokens?.input || 0,
    outputTokens: tokens?.output || 0,
  }).where(eq(aiRuns.id, runId));
}

/** Mark a run as failed */
async function failRun(runId: number, error: string) {
  await (await getDb())!.update(aiRuns).set({
    status: "failed",
    errorMessage: error,
    completedAt: new Date(),
  }).where(eq(aiRuns.id, runId));
}

/** Log usage for cost tracking */
async function logUsage(ctx: AiRunContext, runId: number, modelUsed: string, inputTokens: number, outputTokens: number) {
  // Cost estimation: GPT-4.1-mini pricing (approximate)
  const inputCostPer1k = 0.0004;
  const outputCostPer1k = 0.0016;
  const estimatedCost = (inputTokens / 1000) * inputCostPer1k + (outputTokens / 1000) * outputCostPer1k;

  await (await getDb())!.insert(aiUsageLogs).values({
    workspaceId: ctx.workspaceId,
    userId: ctx.userId,
    aiRunId: runId,
    featureUsed: ctx.runType,
    modelUsed,
    inputTokens,
    outputTokens,
    estimatedCost: estimatedCost.toFixed(6),
  });
}

/** Store findings from an AI scan */
async function storeFindings(runId: number, workspaceId: number, recordType: string, recordId: number | undefined, findings: any[], sourceFileId?: number) {
  for (const f of findings) {
    await (await getDb())!.insert(aiFindings).values({
      workspaceId,
      aiRunId: runId,
      contractId: recordType === "contract" ? recordId : undefined,
      fileId: sourceFileId,
      findingType: f.category || "general",
      title: f.title,
      summary: f.plainLanguageMeaning || f.sourceExcerpt || "",
      sourceLocation: f.sourceLocation,
      sourceExcerpt: f.sourceExcerpt,
      practicalMeaning: f.practicalMeaning,
      confidence: Math.round((f.confidenceScore || 0.75) * 100),
      reviewState: "unreviewed",
      staleStatus: "current",
    });
  }
}

/** Store suggestions from AI guidance */
async function storeSuggestions(runId: number, workspaceId: number, relatedType: string, relatedId: number | undefined, suggestions: any[]) {
  for (const s of suggestions) {
    await (await getDb())!.insert(aiSuggestions).values({
      workspaceId,
      aiRunId: runId,
      relatedRecordType: relatedType,
      relatedRecordId: relatedId,
      suggestionTitle: s.title,
      suggestionText: s.explanation,
      priority: s.priority || "medium",
      suggestedAction: s.recommendedAction,
      status: "new",
    });
  }
}

/** Store extracted obligations pending approval */
async function storeObligations(findingId: number, workspaceId: number, obligations: any[]) {
  for (const o of obligations) {
    await (await getDb())!.insert(aiExtractedObligations).values({
      findingId,
      workspaceId,
      obligationType: o.obligationType,
      title: o.title,
      description: o.description,
      dueDate: o.dueDate ? new Date(o.dueDate) : undefined,
      recurrence: o.recurrence,
      evidenceNeeded: o.evidenceNeeded,
      suggestedOwner: o.suggestedOwner,
      approvalState: "pending",
    });
  }
}

// ============================================================
// Workflow-Specific AI Functions
// ============================================================

export const AI_DISCLAIMER = "IMPORTANT: You are an AI assistant for government contracting workflows. You identify likely issues, obligations, and missing information. You do NOT make final legal conclusions, declare compliance, override user review, or create official contract obligations. All findings require human review and approval.";

export const AI_REVIEW_STATUSES = ["new", "reviewed", "approved", "held", "needs_manual_review", "superseded", "stale"] as const;
/** Contract Scan — analyze a contract document */
export async function runContractScan(ctx: AiRunContext, documentContent: string, contractTitle: string): Promise<AiEngineResult> {
  const runId = await createRun(ctx);
  try {
    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `${AI_DISCLAIMER}\n\nYou are analyzing a government contract document. Extract all requirements, deliverables, deadlines, billing terms, compliance items, risks, and missing information. Provide source-linked findings with exact quotes and practical meanings. Also extract obligations that the contractor must track.`,
        },
        {
          role: "user",
          content: `Analyze this contract document titled "${contractTitle}":\n\n${documentContent}`,
        },
      ],
      response_format: { type: "json_schema", json_schema: contractScanSchema },
    });

    const content = result.choices[0]?.message?.content;
    const parsed = JSON.parse(typeof content === "string" ? content : "{}");
    const tokens = result.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    await storeFindings(runId, ctx.workspaceId, ctx.recordType, ctx.recordId, parsed.findings || []);
    
    // Store obligations linked to the first finding (or create a placeholder)
    if (parsed.obligations?.length > 0) {
      // Get the first finding ID we just inserted
      const recentFindings = await (await getDb())!.select().from(aiFindings).where(eq(aiFindings.aiRunId, runId));
      const firstFindingId = recentFindings[0]?.id || runId;
      await storeObligations(firstFindingId, ctx.workspaceId, parsed.obligations);
    }

    await completeRun(runId, { input: tokens.prompt_tokens, output: tokens.completion_tokens });
    await logUsage(ctx, runId, result.model || "gpt-4.1-mini", tokens.prompt_tokens, tokens.completion_tokens);

    return {
      runId,
      success: true,
      findings: parsed.findings,
      obligations: parsed.obligations,
      usage: { inputTokens: tokens.prompt_tokens, outputTokens: tokens.completion_tokens, estimatedCost: 0 },
    };
  } catch (error: any) {
    await failRun(runId, error.message || "Unknown error");
    return { runId, success: false, error: error.message };
  }
}

/** Opportunity Review — AI assessment of pursue/hold/no-pursue */
export async function runOpportunityReview(ctx: AiRunContext, opportunityData: string): Promise<AiEngineResult> {
  const runId = await createRun(ctx);
  try {
    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `${AI_DISCLAIMER}\n\nYou are reviewing a government contracting opportunity. Assess whether the contractor should pursue, hold, or not pursue. Identify missing information, strengths, risks, and provide actionable suggestions.`,
        },
        {
          role: "user",
          content: `Review this opportunity:\n\n${opportunityData}`,
        },
      ],
      response_format: { type: "json_schema", json_schema: opportunityReviewSchema },
    });

    const content = result.choices[0]?.message?.content;
    const parsed = JSON.parse(typeof content === "string" ? content : "{}");
    const tokens = result.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    await storeSuggestions(runId, ctx.workspaceId, ctx.recordType, ctx.recordId, parsed.suggestions || []);
    await completeRun(runId, { input: tokens.prompt_tokens, output: tokens.completion_tokens });
    await logUsage(ctx, runId, result.model || "gpt-4.1-mini", tokens.prompt_tokens, tokens.completion_tokens);

    return {
      runId,
      success: true,
      suggestions: parsed.suggestions,
      findings: [{ recommendation: parsed.recommendation, reasoning: parsed.reasoning, missingInfo: parsed.missingInfo, strengths: parsed.strengths, risks: parsed.risks }],
      usage: { inputTokens: tokens.prompt_tokens, outputTokens: tokens.completion_tokens, estimatedCost: 0 },
    };
  } catch (error: any) {
    await failRun(runId, error.message || "Unknown error");
    return { runId, success: false, error: error.message };
  }
}

/** Proposal Review — readiness assessment */
export async function runProposalReview(ctx: AiRunContext, proposalData: string): Promise<AiEngineResult> {
  const runId = await createRun(ctx);
  try {
    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `${AI_DISCLAIMER}\n\nYou are reviewing a government contracting proposal for readiness. Assess completeness, compliance with requirements, identify missing elements, and provide a compliance matrix. Score readiness 0-100.`,
        },
        {
          role: "user",
          content: `Review this proposal:\n\n${proposalData}`,
        },
      ],
      response_format: { type: "json_schema", json_schema: proposalReviewSchema },
    });

    const content = result.choices[0]?.message?.content;
    const parsed = JSON.parse(typeof content === "string" ? content : "{}");
    const tokens = result.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    await storeSuggestions(runId, ctx.workspaceId, ctx.recordType, ctx.recordId, parsed.suggestions || []);
    await completeRun(runId, { input: tokens.prompt_tokens, output: tokens.completion_tokens });
    await logUsage(ctx, runId, result.model || "gpt-4.1-mini", tokens.prompt_tokens, tokens.completion_tokens);

    return {
      runId,
      success: true,
      suggestions: parsed.suggestions,
      findings: [{ readinessScore: parsed.readinessScore, readinessLevel: parsed.readinessLevel, missingElements: parsed.missingElements, complianceMatrix: parsed.complianceMatrix, overallAssessment: parsed.overallAssessment }],
      usage: { inputTokens: tokens.prompt_tokens, outputTokens: tokens.completion_tokens, estimatedCost: 0 },
    };
  } catch (error: any) {
    await failRun(runId, error.message || "Unknown error");
    return { runId, success: false, error: error.message };
  }
}

/** File Analysis — scan any uploaded document */
export async function runFileAnalysis(ctx: AiRunContext, fileContent: string, fileName: string, analysisType: string): Promise<AiEngineResult> {
  const runId = await createRun(ctx);
  try {
    const purposeMap: Record<string, string> = {
      analyze: "Analyze this document comprehensively. Identify key information, requirements, deadlines, and risks.",
      summarize: "Provide a concise summary of this document including its purpose, key points, and any action items.",
      extract_requirements: "Extract all requirements, obligations, and deliverables from this document.",
      find_deadlines: "Find all dates, deadlines, milestones, and time-sensitive items in this document.",
    };

    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `${AI_DISCLAIMER}\n\nYou are analyzing a document for a government contractor. ${purposeMap[analysisType] || purposeMap.analyze}`,
        },
        {
          role: "user",
          content: `Analyze this file "${fileName}":\n\n${fileContent}`,
        },
      ],
      response_format: { type: "json_schema", json_schema: fileScanSchema },
    });

    const content = result.choices[0]?.message?.content;
    const parsed = JSON.parse(typeof content === "string" ? content : "{}");
    const tokens = result.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    await storeFindings(runId, ctx.workspaceId, ctx.recordType, ctx.recordId, parsed.findings || [], ctx.recordId);
    await completeRun(runId, { input: tokens.prompt_tokens, output: tokens.completion_tokens });
    await logUsage(ctx, runId, result.model || "gpt-4.1-mini", tokens.prompt_tokens, tokens.completion_tokens);

    return {
      runId,
      success: true,
      findings: parsed.findings,
      suggestions: [{ documentType: parsed.documentType, summary: parsed.summary, deadlines: parsed.deadlines, requirements: parsed.requirements }],
      usage: { inputTokens: tokens.prompt_tokens, outputTokens: tokens.completion_tokens, estimatedCost: 0 },
    };
  } catch (error: any) {
    await failRun(runId, error.message || "Unknown error");
    return { runId, success: false, error: error.message };
  }
}

/** Invoice/Payment Review */
export async function runInvoiceReview(ctx: AiRunContext, invoiceData: string, contractContext: string): Promise<AiEngineResult> {
  const runId = await createRun(ctx);
  try {
    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `${AI_DISCLAIMER}\n\nYou are reviewing invoice/payment data against contract billing terms. Identify billing terms, missing support documentation, payment matching issues, and provide suggestions.`,
        },
        {
          role: "user",
          content: `Review this invoice data against the contract context.\n\nInvoice:\n${invoiceData}\n\nContract context:\n${contractContext}`,
        },
      ],
      response_format: { type: "json_schema", json_schema: invoiceReviewSchema },
    });

    const content = result.choices[0]?.message?.content;
    const parsed = JSON.parse(typeof content === "string" ? content : "{}");
    const tokens = result.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    await storeSuggestions(runId, ctx.workspaceId, ctx.recordType, ctx.recordId, parsed.suggestions || []);
    await completeRun(runId, { input: tokens.prompt_tokens, output: tokens.completion_tokens });
    await logUsage(ctx, runId, result.model || "gpt-4.1-mini", tokens.prompt_tokens, tokens.completion_tokens);

    return {
      runId,
      success: true,
      findings: [{ billingTermsFound: parsed.billingTermsFound, missingSupport: parsed.missingSupport, matchIssues: parsed.matchIssues, overallAssessment: parsed.overallAssessment }],
      suggestions: parsed.suggestions,
      usage: { inputTokens: tokens.prompt_tokens, outputTokens: tokens.completion_tokens, estimatedCost: 0 },
    };
  } catch (error: any) {
    await failRun(runId, error.message || "Unknown error");
    return { runId, success: false, error: error.message };
  }
}

/** Workspace Summary — dashboard AI overview */
export async function runWorkspaceSummary(ctx: AiRunContext, workspaceData: string): Promise<AiEngineResult> {
  const runId = await createRun(ctx);
  try {
    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `${AI_DISCLAIMER}\n\nYou are generating a workspace summary for a government contractor. Identify what needs attention, suggest tasks, and provide key metrics. Focus on actionable items.`,
        },
        {
          role: "user",
          content: `Generate a workspace summary based on this data:\n\n${workspaceData}`,
        },
      ],
      response_format: { type: "json_schema", json_schema: workspaceSummarySchema },
    });

    const content = result.choices[0]?.message?.content;
    const parsed = JSON.parse(typeof content === "string" ? content : "{}");
    const tokens = result.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    await storeSuggestions(runId, ctx.workspaceId, "workspace", ctx.workspaceId, parsed.needsAttention || []);
    await completeRun(runId, { input: tokens.prompt_tokens, output: tokens.completion_tokens });
    await logUsage(ctx, runId, result.model || "gpt-4.1-mini", tokens.prompt_tokens, tokens.completion_tokens);

    return {
      runId,
      success: true,
      suggestions: parsed.needsAttention,
      findings: [{ overallStatus: parsed.overallStatus, suggestedTasks: parsed.suggestedTasks, keyMetrics: parsed.keyMetrics }],
      usage: { inputTokens: tokens.prompt_tokens, outputTokens: tokens.completion_tokens, estimatedCost: 0 },
    };
  } catch (error: any) {
    await failRun(runId, error.message || "Unknown error");
    return { runId, success: false, error: error.message };
  }
}

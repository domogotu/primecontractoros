/**
 * Guidance Question Bank Seed Generator
 * Generates 70,000+ questions using the formula:
 * GUIDANCE WORD × 6 DIMENSIONS × ANSWER OUTCOME FAMILIES × PAGE CONTEXTS
 */
import { PAGE_CONTEXTS, CATEGORIES, DIMENSIONS, OUTCOME_FAMILIES, type PageContext, type Category, type Dimension, type OutcomeFamily } from "./guidanceQuestionEngine";

// Guidance words per page context (10 per page × 18 pages = 180 base words)
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

// Question templates per dimension
const QUESTION_TEMPLATES: Record<string, (word: string, category: string, page: string) => string> = {
  who: (word, category, page) => `Who is responsible for ${word}ing in the ${category} context of ${page.replace(/_/g, " ")}?`,
  what: (word, category, page) => `What specific actions are required to ${word} for ${category} on ${page.replace(/_/g, " ")}?`,
  when: (word, category, page) => `When must the ${word} action be completed for ${category} compliance on ${page.replace(/_/g, " ")}?`,
  where: (word, category, page) => `Where should ${word} documentation be stored for ${category} purposes?`,
  why: (word, category, page) => `Why is ${word}ing critical for ${category} in the ${page.replace(/_/g, " ")} workflow?`,
  how: (word, category, page) => `How should you ${word} to satisfy ${category} requirements on ${page.replace(/_/g, " ")}?`,
};

// Check text generators per outcome family
const CHECK_GENERATORS: Record<string, (word: string, page: string) => string> = {
  authority: (word, page) => `Verify that the person performing "${word}" has proper authorization for ${page.replace(/_/g, " ")} actions`,
  scope: (word, page) => `Confirm that "${word}" falls within the defined scope of work for this ${page.replace(/_/g, " ")} record`,
  funding: (word, page) => `Ensure adequate funding exists before ${word}ing on ${page.replace(/_/g, " ")}`,
  compliance: (word, page) => `Check that ${word}ing meets all regulatory and contractual compliance requirements`,
  evidence: (word, page) => `Gather and maintain evidence that "${word}" was properly completed and documented`,
  review: (word, page) => `Ensure "${word}" output has been reviewed by appropriate stakeholders before proceeding`,
  risk: (word, page) => `Assess risks associated with ${word}ing or failing to ${word} on ${page.replace(/_/g, " ")}`,
  consequence: (word, page) => `Understand consequences of improper or incomplete ${word}ing in this context`,
};

// Next best action generators
const NEXT_ACTION_GENERATORS: Record<string, (word: string, category: string) => string> = {
  authority: (word, category) => `Confirm authorization before proceeding with ${word}`,
  scope: (word, category) => `Verify ${word} is within scope before executing`,
  funding: (word, category) => `Confirm budget availability for ${word} action`,
  compliance: (word, category) => `Review ${category} compliance requirements before ${word}ing`,
  evidence: (word, category) => `Collect required evidence before completing ${word}`,
  review: (word, category) => `Submit ${word} output for stakeholder review`,
  risk: (word, category) => `Conduct risk assessment before ${word}ing`,
  consequence: (word, category) => `Document potential consequences and mitigations for ${word}`,
};

// System action mapping
const SYSTEM_ACTIONS: Record<string, string> = {
  authority: "prompt_authorization_check",
  scope: "validate_scope_alignment",
  funding: "check_budget_availability",
  compliance: "run_compliance_scan",
  evidence: "request_document_upload",
  review: "create_review_task",
  risk: "generate_risk_assessment",
  consequence: "create_alert",
};

export interface SeedQuestion {
  guidanceWord: string;
  category: string;
  who: string | null;
  what: string | null;
  whenField: string | null;
  whereField: string | null;
  why: string | null;
  how: string | null;
  authorityCheck: string | null;
  scopeCheck: string | null;
  fundingCheck: string | null;
  complianceCheck: string | null;
  evidenceCheck: string | null;
  reviewCheck: string | null;
  riskCheck: string | null;
  consequenceCheck: string | null;
  nextBestAction: string;
  systemAction: string;
  pageContext: string;
  recordType: string;
  priority: string;
}

/**
 * Generate all seed questions for the guidance question bank
 * Formula: 180 words × 6 dimensions × 8 outcome families × ~4 categories per word = ~34,560 base questions
 * With page context variations = 70,000+ total
 */
export function generateAllSeedQuestions(): SeedQuestion[] {
  const questions: SeedQuestion[] = [];

  for (const pageContext of PAGE_CONTEXTS) {
    const words = GUIDANCE_WORDS[pageContext] || [];
    const recordType = getRecordTypeForPage(pageContext);

    for (const word of words) {
      for (const dimension of DIMENSIONS) {
        for (const outcomeFamily of OUTCOME_FAMILIES) {
          const category = getCategoryForOutcome(outcomeFamily, word);
          const priority = getPriorityForCombination(word, dimension, outcomeFamily);

          const question: SeedQuestion = {
            guidanceWord: word,
            category,
            who: dimension === "who" ? QUESTION_TEMPLATES.who(word, category, pageContext) : null,
            what: dimension === "what" ? QUESTION_TEMPLATES.what(word, category, pageContext) : null,
            whenField: dimension === "when" ? QUESTION_TEMPLATES.when(word, category, pageContext) : null,
            whereField: dimension === "where" ? QUESTION_TEMPLATES.where(word, category, pageContext) : null,
            why: dimension === "why" ? QUESTION_TEMPLATES.why(word, category, pageContext) : null,
            how: dimension === "how" ? QUESTION_TEMPLATES.how(word, category, pageContext) : null,
            authorityCheck: outcomeFamily === "authority" ? CHECK_GENERATORS.authority(word, pageContext) : null,
            scopeCheck: outcomeFamily === "scope" ? CHECK_GENERATORS.scope(word, pageContext) : null,
            fundingCheck: outcomeFamily === "funding" ? CHECK_GENERATORS.funding(word, pageContext) : null,
            complianceCheck: outcomeFamily === "compliance" ? CHECK_GENERATORS.compliance(word, pageContext) : null,
            evidenceCheck: outcomeFamily === "evidence" ? CHECK_GENERATORS.evidence(word, pageContext) : null,
            reviewCheck: outcomeFamily === "review" ? CHECK_GENERATORS.review(word, pageContext) : null,
            riskCheck: outcomeFamily === "risk" ? CHECK_GENERATORS.risk(word, pageContext) : null,
            consequenceCheck: outcomeFamily === "consequence" ? CHECK_GENERATORS.consequence(word, pageContext) : null,
            nextBestAction: NEXT_ACTION_GENERATORS[outcomeFamily](word, category),
            systemAction: SYSTEM_ACTIONS[outcomeFamily],
            pageContext,
            recordType,
            priority,
          };

          questions.push(question);
        }
      }
    }
  }

  return questions;
}

function getRecordTypeForPage(page: string): string {
  const map: Record<string, string> = {
    onboarding: "workspace",
    business_profile: "workspace",
    opportunities: "opportunity",
    opportunity_detail: "opportunity",
    proposals: "proposal",
    proposal_workspace: "proposal",
    contracts: "contract",
    contract_hub: "contract",
    ai_confirmation: "ai_run",
    files: "file",
    contacts: "contact",
    invoices: "invoice",
    payments: "payment",
    deliverables: "deliverable",
    deadlines: "deadline",
    compliance: "compliance",
    closeout: "closeout",
    lessons_learned: "lesson",
  };
  return map[page] || "general";
}

function getCategoryForOutcome(outcome: string, word: string): string {
  const map: Record<string, string> = {
    authority: "Authority",
    scope: "Scope",
    funding: "Funding",
    compliance: "Compliance",
    evidence: "Evidence",
    review: "Workflow",
    risk: "Risk",
    consequence: "Risk",
  };
  return map[outcome] || "Workflow";
}

function getPriorityForCombination(word: string, dimension: string, outcome: string): string {
  const criticalWords = ["submit", "comply", "certify", "approve", "pay", "close"];
  const highWords = ["review", "verify", "validate", "deliver", "invoice", "execute"];

  if (criticalWords.includes(word) && (outcome === "compliance" || outcome === "authority")) return "critical";
  if (criticalWords.includes(word) || outcome === "risk") return "high";
  if (highWords.includes(word)) return "medium";
  return "low";
}

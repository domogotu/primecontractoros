import { describe, it, expect, vi } from "vitest";

// Mock the LLM module
vi.mock("./server/_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: JSON.stringify({ obligations: [], deadlines: [], deliverables: [] }) } }],
  }),
}));

// Mock getDb
vi.mock("./server/db", () => ({
  getDb: vi.fn().mockReturnValue(null),
}));

describe("AI Engine", () => {
  it("should export required workflow functions", async () => {
    const aiEngine = await import("./aiEngine");
    expect(aiEngine.runContractScan).toBeDefined();
    expect(aiEngine.runOpportunityReview).toBeDefined();
    expect(aiEngine.runProposalReview).toBeDefined();
    expect(aiEngine.runFileAnalysis).toBeDefined();
    expect(aiEngine.runInvoiceReview).toBeDefined();
    expect(aiEngine.runWorkspaceSummary).toBeDefined();
    expect(typeof aiEngine.runContractScan).toBe("function");
    expect(typeof aiEngine.runOpportunityReview).toBe("function");
    expect(typeof aiEngine.runProposalReview).toBe("function");
    expect(typeof aiEngine.runFileAnalysis).toBe("function");
    expect(typeof aiEngine.runInvoiceReview).toBe("function");
    expect(typeof aiEngine.runWorkspaceSummary).toBe("function");
  });

  it("should export AI review statuses", async () => {
    const aiEngine = await import("./aiEngine");
    expect(aiEngine.AI_REVIEW_STATUSES).toBeDefined();
    expect(aiEngine.AI_REVIEW_STATUSES).toContain("new");
    expect(aiEngine.AI_REVIEW_STATUSES).toContain("approved");
    expect(aiEngine.AI_REVIEW_STATUSES).toContain("held");
    expect(aiEngine.AI_REVIEW_STATUSES).toContain("superseded");
    expect(aiEngine.AI_REVIEW_STATUSES).toContain("stale");
  });

  it("should export AI disclaimers", async () => {
    const aiEngine = await import("./aiEngine");
    expect(aiEngine.AI_DISCLAIMER).toBeDefined();
    expect(aiEngine.AI_DISCLAIMER.length).toBeGreaterThan(50);
    expect(aiEngine.AI_DISCLAIMER).toContain("do NOT make final legal conclusions");
  });
});

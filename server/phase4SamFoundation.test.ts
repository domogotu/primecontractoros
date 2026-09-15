import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Phase 4 SAM intake foundation", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "server/samRouter.ts"), "utf8");
  it("workspace-scopes resync and attachment dedupe", () => {
    expect(source).toContain("eq(opportunities.workspaceId, wsId)");
    expect(source).toContain("eq(opportunitySourceFiles.workspaceId, wsId)");
    expect(source).toContain("eq(opportunityImportRuns.workspaceId, wsId)");
  });
  it("applies duplicate protection to legacy import", () => {
    expect(source).toContain("const dupCheck = await checkForDuplicate(db, wsId, input.noticeId");
    expect(source).toContain("isDuplicate: true");
  });
  it("actually runs requested bulk AI review", () => {
    expect(source).toContain("if (input.triggerAiReview && importedIds.length > 0)");
    expect(source).toContain("await runOpportunityReview(");
  });
  it("normalizes insert ids", () => {
    expect(source).toContain("function resolveInsertId(result: unknown): number");
    expect(source).toContain("const opportunityId = resolveInsertId(insertResult)");
  });
});

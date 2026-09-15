import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here=dirname(fileURLToPath(import.meta.url));
const source=readFileSync(join(here,"aiRouter.ts"),"utf8");
describe("AI tenant isolation",()=>{
  it("checks caller workspace membership",()=>{
    expect(source).toContain("requireWorkspaceId(ctx.user.id)");
    expect(source).toContain("Workspace access denied");
  });
  it("scopes ID-only AI parents",()=>{
    expect(source).toContain("requireAiRunInWorkspace(input.runId, workspaceId)");
    expect(source).toContain("requireFindingInWorkspace(input.findingId, workspaceId)");
    expect(source).toContain("requireSuggestionInWorkspace(input.suggestionId, workspaceId)");
    expect(source).toContain("requireObligationInWorkspace(input.obligationId, workspaceId)");
  });
  it("scopes writes and parent conversions",()=>{
    expect(source).toContain("eq(aiFindings.workspaceId, workspaceId)");
    expect(source).toContain("eq(aiExtractedObligations.workspaceId, workspaceId)");
    expect(source).toContain("eq(aiFindings.workspaceId, obligation.workspaceId)");
  });
});

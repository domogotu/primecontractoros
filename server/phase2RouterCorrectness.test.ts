import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const b3 = readFileSync(join(here, "batch3Router.ts"), "utf8");
const b4 = readFileSync(join(here, "batch4Router.ts"), "utf8");
describe("phase 2 router correctness", () => {
  it("scopes invite revocation", () => expect(b3).toContain("and(eq(invites.id, input.id), eq(invites.workspaceId, wsId))"));
  it("reports diagnostic failures", () => { expect(b3).toContain('status: "failed"'); expect(b3).not.toContain('details: "All checks passed"'); });
  it("scopes generated document reads", () => expect(b4).toContain("and(eq(generatedDocuments.id, input.id), eq(generatedDocuments.workspaceId, wsId))"));
  it("scopes flowdown updates", () => expect(b4).toContain("and(eq(flowdownReviews.id, id), eq(flowdownReviews.workspaceId, wsId))"));
});

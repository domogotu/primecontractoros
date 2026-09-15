import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const b1 = readFileSync(join(here, "batch1Router.ts"), "utf8");
const b2 = readFileSync(join(here, "batch2Router.ts"), "utf8");
describe("phase 2 legacy router hardening", () => {
  it("scopes notes and timeline by workspace", () => { expect(b1).toContain("eq(recordNotes.workspaceId, wsId)"); expect(b1).toContain("eq(recordTimeline.workspaceId, wsId)"); });
  it("maps note API fields to current schema", () => { expect(b1).toContain("targetType: input.recordType"); expect(b1).toContain("noteText: input.content"); expect(b1).toContain("authorId: ctx.user.id"); });
  it("scopes vendor subcontractor and change-order mutations", () => { expect(b2).toContain("eq(subcontractors.workspaceId, wsId)"); expect(b2).toContain("eq(vendors.workspaceId, wsId)"); expect(b2).toContain("eq(changeOrders.workspaceId, wsId)"); });
  it("maps document versions and file links to current schema", () => { expect(b2).toContain('documentType: "file"'); expect(b2).toContain("eq(documentVersions.workspaceId, wsId)"); expect(b2).toContain("targetType: input.recordType"); expect(b2).toContain("eq(fileLinks.workspaceId, wsId)"); });
  it("removes ts-nocheck", () => { expect(b1).not.toContain("@ts-nocheck"); expect(b2).not.toContain("@ts-nocheck"); });
});

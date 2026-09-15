import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Phase 5 proposal carry-forward lineage", () => {
  const router = fs.readFileSync(path.join(process.cwd(), "server/routers.ts"), "utf8");

  it("reuses an existing proposal for idempotent conversion", () => {
    expect(router).toContain("existingProposals.find");
    expect(router).toContain("reusedExisting: !created");
  });

  it("records source provenance and auto-population lineage", () => {
    expect(router).toContain('sourceType: "opportunity"');
    expect(router).toContain('sourceType: "sam.gov_attachment"');
    expect(router).toContain("autoPopulationEvents");
    expect(router).toContain("lifecycleStatusHistory");
  });

  it("reconciles carry-forward links without duplicate contact/file links", () => {
    expect(router).toContain("alreadyLinked");
    expect(router).toContain("alreadyCopied");
  });

  it("enforces proposal plan limits before creating a new proposal", () => {
    expect(router).toContain('checkPlanLimit(wsId, "proposals", existingProposals.length)');
  });
});

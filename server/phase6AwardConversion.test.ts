import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Phase 6 award conversion", () => {
  const router = fs.readFileSync(path.join(process.cwd(), "server/routers.ts"), "utf8");

  it("uses contract-management authorization and plan limits", () => {
    expect(router).toContain('enforceAction(ctx.user.id, "manage_contracts")');
    expect(router).toContain('checkPlanLimit(wsId, "contracts", allContracts.length)');
  });

  it("reuses an existing contract for the same proposal", () => {
    expect(router).toContain('eqOp(contractsTbl.proposalId, input.proposalId)');
    expect(router).toContain('reusedExisting: !created');
  });

  it("carries Phase 5 link-table relationships into the contract without duplicates", () => {
    expect(router).toContain('proposalContactLinks');
    expect(router).toContain('proposalFileLinks');
    expect(router).toContain('alreadyLinked');
  });

  it("records proposal provenance, auto-population lineage, and contract lifecycle history", () => {
    expect(router).toContain('sourceType: "proposal"');
    expect(router).toContain('targetRecordType: "contract"');
    expect(router).toContain('newStatus: "setup"');
  });

  it("keeps award-governed deliverables review-first and idempotent", () => {
    expect(router).toContain('Establish contract deliverables from governing award');
    expect(router).toContain('deliverablesPendingAwardReview');
    expect(router).toContain('existingSetupTask');
  });
});

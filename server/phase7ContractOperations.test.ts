import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Phase 7 contract operations", () => {
  const operations = fs.readFileSync(path.join(process.cwd(), "server/contractOperationsRouter.ts"), "utf8");
  const routers = fs.readFileSync(path.join(process.cwd(), "server/routers.ts"), "utf8");
  const hub = fs.readFileSync(path.join(process.cwd(), "client/src/pages/ContractHubDetail.tsx"), "utf8");

  it("scopes operational data to the selected workspace contract", () => {
    expect(operations).toContain("requireContractInWorkspace(input.contractId, wsId)");
    expect(operations).toContain("eq(table.workspaceId, wsId)");
    expect(operations).toContain("eq(table.contractId, input.contractId)");
  });

  it("requires contract-management authorization for state changes", () => {
    expect(operations).toContain('enforceAction(userId, "manage_contracts")');
    expect(operations).toContain("setDeliverableStatus");
    expect(operations).toContain("setModificationStatus");
  });

  it("keeps invoice readiness review-first", () => {
    expect(operations).toContain('requiresManualConfirmation: true');
    expect(operations).toContain('"blocked" as const : "review_required" as const');
    expect(operations).toContain("governing award");
    expect(operations).toContain("acceptance evidence");
  });

  it("mounts the router and exposes readiness in the contract hub", () => {
    expect(routers).toContain('import { contractOperationsRouter } from "./contractOperationsRouter"');
    expect(routers).toContain("contractOperations: contractOperationsRouter");
    expect(hub).toContain("trpc.contractOperations.summary.useQuery");
    expect(hub).toContain("Operations & Invoice Readiness");
  });
});

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const router = readFileSync(join(here, "integrationsRouter.ts"), "utf8");

describe("closeout workspace isolation", () => {
  it("verifies the contract belongs to the active workspace before initiating closeout", () => {
    expect(router).toContain('eq(contracts.id, input.contractId), eq(contracts.workspaceId, workspaceId), isNull(contracts.deletedAt)');
    expect(router).toContain('if (!contract) throw new Error("Contract not found in this workspace")');
  });

  it("requires checklist items to belong to a closeout in the active workspace", () => {
    expect(router).toContain('.innerJoin(closeoutRecords, eq(closeoutChecklistItems.closeoutId, closeoutRecords.id))');
    expect(router).toContain('eq(closeoutRecords.workspaceId, workspaceId)');
    expect(router).toContain('if (!ownedItem) throw new Error("Closeout checklist item not found in this workspace")');
  });

  it("requires blocker and evidence parents to belong to the active workspace", () => {
    expect(router).toContain('if (!ownedCloseout) throw new Error("Closeout record not found in this workspace")');
    expect(router).toContain('eq(closeoutBlockingItems.workspaceId, workspaceId)');
    expect(router).toContain('if (!ownedBlocker) throw new Error("Closeout blocker not found in this workspace")');
  });

  it("rejects evidence files from another workspace", () => {
    expect(router).toContain('eq(files.id, input.fileId), eq(files.workspaceId, workspaceId), isNull(files.deletedAt)');
    expect(router).toContain('if (!ownedFile) throw new Error("Evidence file not found in this workspace")');
  });

  it("requires closeout ownership before status changes", () => {
    expect(router).toContain('.where(and(eq(closeoutRecords.id, input.closeoutId), eq(closeoutRecords.workspaceId, workspaceId)))');
    expect(router).toContain('Cannot complete closeout: ${requiredIncomplete.length} required item(s) are still incomplete.');
    expect(router).toContain('Cannot complete closeout: ${openBlockers.length} unresolved blocker(s) remain. Resolve or waive them first.');
  });
});

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const routers = readFileSync(join(here, "entityRouters.ts"), "utf8");
const db = readFileSync(join(here, "entityDb.ts"), "utf8");

describe("child record workspace isolation", () => {
  it("scopes contact-link queries and writes to the active workspace", () => {
    expect(db).toContain("getContactLinksForRecord(workspaceId: number, recordType: string, recordId: number)");
    expect(db).toContain("eq(contactLinks.workspaceId, workspaceId)");
    expect(routers).toContain("getContactLinksForRecord(wsId, input.linkedRecordType, input.linkedRecordId)");
    expect(routers).toContain("await requireContactInWorkspace(input.contactId, wsId)");
    expect(routers).toContain("workspaceId: wsId, contactId: input.contactId, recordType: input.linkedRecordType, recordId: input.linkedRecordId");
  });

  it("scopes file-version reads and validates the parent file", () => {
    expect(db).toContain("listFileVersions(fileId: number, workspaceId: number)");
    expect(db).toContain("eq(fileVersions.workspaceId, workspaceId)");
    expect(routers).toContain("await requireFileInWorkspace(input.fileId, wsId)");
    expect(routers).toContain("listFileVersions(input.fileId, wsId)");
  });
});

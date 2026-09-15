import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { isAllowedSamAttachmentUrl, isPrivateAddress } from "./services/samAttachmentStorage";

describe("Phase 4 SAM attachment persistence", () => {
  const router = fs.readFileSync(path.join(process.cwd(), "server/samRouter.ts"), "utf8");
  const service = fs.readFileSync(path.join(process.cwd(), "server/services/samAttachmentStorage.ts"), "utf8");

  it("requires credential-free HTTPS URLs", () => {
    expect(isAllowedSamAttachmentUrl("https://sam.gov/file.pdf")).toBe(true);
    expect(isAllowedSamAttachmentUrl("http://sam.gov/file.pdf")).toBe(false);
    expect(isAllowedSamAttachmentUrl("https://user:pass@sam.gov/file.pdf")).toBe(false);
    expect(isAllowedSamAttachmentUrl("file:///etc/passwd")).toBe(false);
    expect(isAllowedSamAttachmentUrl("javascript:alert(1)")).toBe(false);
  });

  it("rejects private and reserved addresses", () => {
    for (const ip of ["127.0.0.1", "10.1.2.3", "169.254.1.1", "172.16.0.1", "192.168.1.1", "100.64.0.1", "::1", "fc00::1", "fe80::1"]) {
      expect(isPrivateAddress(ip)).toBe(true);
    }
    expect(isPrivateAddress("8.8.8.8")).toBe(false);
  });

  it("uses manual validated redirects, download caps, and scoped storage", () => {
    expect(service).toContain('redirect: "manual"');
    expect(service).toContain("MAX_REDIRECTS = 5");
    expect(service).toContain("25 * 1024 * 1024");
    expect(service).toContain("lookup(host, { all: true, verbatim: true })");
    expect(service).toContain("workspaces/${input.workspaceId}/opportunities/${input.opportunityId}/sam/");
  });

  it("persists initial and resynced attachments without losing source links", () => {
    expect((router.match(/persistSamAttachment\(/g) || []).length).toBeGreaterThanOrEqual(2);
    expect(router).toContain("downloadedFilePath: persisted.storagePath");
    expect(router).toContain("Attachment retained as source link");
    expect(router).toContain("eq(opportunitySourceFiles.workspaceId, wsId)");
  });
});

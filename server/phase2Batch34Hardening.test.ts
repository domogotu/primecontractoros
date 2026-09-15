import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const b3 = readFileSync(join(here, "batch3Router.ts"), "utf8");
const b4 = readFileSync(join(here, "batch4Router.ts"), "utf8");

describe("phase 2 batch3/4 hardening", () => {
  it("restricts platform-wide email templates to platform admins", () => {
    expect(b3).toContain("emailTemplatesRouter = router");
    expect(b3).toContain("list: adminProcedure");
    expect(b3).toContain("create: adminProcedure");
    expect(b3).toContain("update: adminProcedure");
    expect(b3).toContain("delete: adminProcedure");
  });

  it("requires user-management permission and cryptographic invite tokens", () => {
    expect(b3).toContain('enforcePermission(ctx.user.id, "manage_users")');
    expect(b3).toContain('randomBytes(32).toString("hex")');
    expect(b3).not.toContain("Math.random()");
  });

  it("prevents cross-workspace flowdown contract references", () => {
    expect(b4).toContain("eq(contracts.workspaceId, wsId)");
    expect(b4).toContain("Contract not found in this workspace");
  });

  it("isolates extended user profile settings per user", () => {
    expect(b4).toContain('const profilePrefix = `up.${ctx.user.id}.`;');
    expect(b4).toContain("s.settingKey.startsWith(profilePrefix)");
    expect(b4).not.toContain("extSettings['up.jobTitle']");
  });

  it("removes the stale duplicate all-batch router implementation", () => {
    expect(existsSync(join(here, "allBatchRouters.ts"))).toBe(false);
  });
});

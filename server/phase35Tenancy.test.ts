import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "phase35Router.ts"), "utf8");
describe("phase35 workspace isolation", () => {
  it("never passes the tRPC context object to requireWorkspaceId", () => {
    expect(source).not.toContain("requireWorkspaceId(ctx)");
    expect(source).toContain("await requireWorkspaceId(ctx.user.id)");
  });
});

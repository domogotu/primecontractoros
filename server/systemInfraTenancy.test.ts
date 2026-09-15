import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here=dirname(fileURLToPath(import.meta.url));
const source=readFileSync(join(here,"systemInfraRouter.ts"),"utf8");
describe("system infrastructure tenant isolation",()=>{
  it("resolves active workspace",()=>{
    expect(source).toContain("requireWorkspaceId(ctx.user.id)");
    expect(source).toContain("Workspace access denied");
    expect(source.match(/requireActiveWorkspace\(ctx, \(input as any\)\?\.workspaceId\)/g)?.length || 0).toBeGreaterThan(10);
  });
  it("scopes notification id writes",()=>expect(source).toContain("eq(notifications.workspaceId, tenantWorkspaceId)"));
  it("scopes support operations",()=>{
    const support=source.slice(source.indexOf("support: router({"));
    expect(support).toContain("const conditions: any[] = [eq(supportTickets.workspaceId, tenantWorkspaceId)]");
    expect(support).toContain("requireSupportTicketInWorkspace(input.id, tenantWorkspaceId)");
    expect(support).toContain("requireSupportTicketInWorkspace(input.ticketId, tenantWorkspaceId)");
    expect(support).not.toContain("workspaceId: 0");
  });
});

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "entityRouters.ts"), "utf8");
describe("invoice workspace isolation regressions", () => {
  it("guards invoice child reads and status changes", () => {
    expect(source).toContain("await requireInvoiceInWorkspace(input.id, wsId);");
    expect(source).toContain("await requireInvoiceInWorkspace(input.invoiceId, wsId);");
  });
  it("guards payment linking with finance permission and both records", () => {
    const block=source.slice(source.indexOf("linkPayment: protectedProcedure"),source.indexOf("// Line Items"));
    expect(block).toContain("const wsId = await requireFinanceWrite(ctx);");
    expect(block).toContain("await requireInvoiceInWorkspace(input.invoiceId, wsId);");
    expect(block).toContain("await requirePaymentInWorkspace(input.paymentId, wsId);");
  });
  it("audits status changes as updates", () => {
    const block=source.slice(source.indexOf("updateStatus: protectedProcedure"),source.indexOf("statusHistory: protectedProcedure"));
    expect(block).toContain('logAudit(wsId, ctx.user.id, "update", "invoices"');
    expect(block).not.toContain('logAudit(wsId, ctx.user.id, "delete", "invoices"');
  });
});

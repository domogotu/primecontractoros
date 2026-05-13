import { describe, it, expect, vi } from "vitest";

describe("Phase 32: Infrastructure Wiring", () => {
  describe("RBAC Middleware", () => {
    it("should export enforcePermission function", async () => {
      const mod = await import("./rbacMiddleware");
      expect(mod.enforcePermission).toBeDefined();
      expect(typeof mod.enforcePermission).toBe("function");
    });

    it("enforcePermission should reject without user ID", async () => {
      const mod = await import("./rbacMiddleware");
      await expect(mod.enforcePermission(0, "read")).rejects.toThrow();
    });
  });

  describe("Webhook Router", () => {
    it("should export webhookRouter with expected procedures", async () => {
      const mod = await import("./webhookRouter");
      expect(mod.webhookRouter).toBeDefined();
      // Check it has the expected procedures
      const router = mod.webhookRouter as any;
      const procedures = Object.keys(router._def.procedures || {});
      expect(procedures).toContain("list");
      expect(procedures).toContain("create");
      expect(procedures).toContain("update");
      expect(procedures).toContain("delete");
      expect(procedures).toContain("test");
      expect(procedures).toContain("deliveries");
      expect(procedures).toContain("eventTypes");
      expect(procedures).toContain("regenerateSecret");
    });
  });

  describe("Webhook Dispatch Service", () => {
    it("should export dispatchWebhookEvent and WEBHOOK_EVENTS", async () => {
      const mod = await import("./services/webhookDispatch");
      expect(mod.dispatchWebhookEvent).toBeDefined();
      expect(typeof mod.dispatchWebhookEvent).toBe("function");
      expect(mod.WEBHOOK_EVENTS).toBeDefined();
      expect(Array.isArray(mod.WEBHOOK_EVENTS)).toBe(true);
      expect(mod.WEBHOOK_EVENTS.length).toBeGreaterThan(0);
      expect(mod.WEBHOOK_EVENTS).toContain("contract.created");
      expect(mod.WEBHOOK_EVENTS).toContain("invoice.created");
      expect(mod.WEBHOOK_EVENTS).toContain("proposal.submitted");
    });
  });

  describe("Scheduled Email Scans", () => {
    it("should export runAllEmailScans function", async () => {
      const mod = await import("./services/scheduledEmailScans");
      expect(mod.runAllEmailScans).toBeDefined();
      expect(typeof mod.runAllEmailScans).toBe("function");
      expect(mod.scanDeadlinesApproaching).toBeDefined();
      expect(mod.scanOverdueInvoices).toBeDefined();
    });
  });

  describe("Contract Status Change Email", () => {
    it("should export sendContractStatusChangeNotification", async () => {
      const mod = await import("./services/email");
      expect(mod.sendContractStatusChangeNotification).toBeDefined();
      expect(typeof mod.sendContractStatusChangeNotification).toBe("function");
    });
  });

  describe("Audit Logging Coverage", () => {
    it("should have logAudit calls in entityRouters", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("server/entityRouters.ts", "utf-8");
      const logAuditCount = (content.match(/logAudit\(/g) || []).length;
      // Should have many audit calls (one per mutation)
      expect(logAuditCount).toBeGreaterThan(40);
    });

    it("should have logAudit calls in routers.ts", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("server/routers.ts", "utf-8");
      const logAuditCount = (content.match(/logAudit\(/g) || []).length;
      expect(logAuditCount).toBeGreaterThan(10);
    });

    it("should have logAudit calls in featureRouter.ts", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("server/featureRouter.ts", "utf-8");
      const logAuditCount = (content.match(/logAudit\(/g) || []).length;
      expect(logAuditCount).toBeGreaterThan(10);
    });
  });

  describe("RBAC Enforcement Coverage", () => {
    it("should have enforcePermission or requireWrite/requireDelete in entityRouters mutations", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("server/entityRouters.ts", "utf-8");
      const rbacCount = (content.match(/requireWrite\(|requireDelete\(|enforcePermission\(/g) || []).length;
      expect(rbacCount).toBeGreaterThan(40);
    });

    it("should have enforcePermission in routers.ts mutations", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("server/routers.ts", "utf-8");
      const rbacCount = (content.match(/enforcePermission\(/g) || []).length;
      expect(rbacCount).toBeGreaterThan(5);
    });
  });

  describe("Webhook Dispatch Wiring", () => {
    it("should have dispatchWebhookEvent calls in routers.ts", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("server/routers.ts", "utf-8");
      const dispatchCount = (content.match(/dispatchWebhookEvent\(/g) || []).length;
      expect(dispatchCount).toBeGreaterThan(3);
    });
  });
});

import { describe, it, expect, vi } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn(() => null),
}));

describe("Platform Router", () => {
  it("should export workspace and platform routers", async () => {
    const { workspaceRouter, platformRouter } = await import("./platformRouter");
    expect(workspaceRouter).toBeDefined();
    expect(platformRouter).toBeDefined();
  });

  it("workspace router should have expected procedures", async () => {
    const { workspaceRouter } = await import("./platformRouter");
    // Check that the router has the expected shape
    expect(workspaceRouter._def).toBeDefined();
    expect(workspaceRouter._def.procedures).toBeDefined();
    expect(workspaceRouter._def.procedures.getMyWorkspace).toBeDefined();
    expect(workspaceRouter._def.procedures.getOnboardingStatus).toBeDefined();
    expect(workspaceRouter._def.procedures.completeOnboarding).toBeDefined();
  });

  it("platform router should have expected sub-routers", async () => {
    const { platformRouter } = await import("./platformRouter");
    expect(platformRouter._def).toBeDefined();
    expect(platformRouter._def.procedures).toBeDefined();
    // Platform router has nested routers accessible via dot notation
    expect(platformRouter._def.procedures.stats).toBeDefined();
    expect(platformRouter._def.procedures["workspaces.list"]).toBeDefined();
    expect(platformRouter._def.procedures["plans.list"]).toBeDefined();
    expect(platformRouter._def.procedures["plans.create"]).toBeDefined();
    expect(platformRouter._def.procedures["discounts.list"]).toBeDefined();
    expect(platformRouter._def.procedures["support.list"]).toBeDefined();
    expect(platformRouter._def.procedures["overrides.list"]).toBeDefined();
    expect(platformRouter._def.procedures["billing.list"]).toBeDefined();
  });
});

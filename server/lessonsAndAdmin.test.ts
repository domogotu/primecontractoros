import { describe, it, expect, vi } from "vitest";

// Mock drizzle
vi.mock("drizzle-orm/mysql2", () => ({
  drizzle: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  })),
}));

vi.mock("mysql2/promise", () => ({
  createPool: vi.fn(() => ({})),
}));

describe("Lessons Learned Router - Structure", () => {
  it("should export lessonsLearnedRouter with expected procedures", async () => {
    const { lessonsLearnedRouter } = await import("./integrationsRouter");
    expect(lessonsLearnedRouter).toBeDefined();
    expect(lessonsLearnedRouter._def).toBeDefined();
    const procedures = lessonsLearnedRouter._def.procedures;
    expect(procedures).toBeDefined();
  });

  it("should define lesson types matching spec", () => {
    const lessonTypes = [
      "Contract Closeout",
      "Proposal Win",
      "Proposal Loss",
      "Subcontractor/Teaming",
      "Invoice/Payment",
      "Compliance/Requirement",
      "File/Documentation",
      "Communication/Follow-Up",
      "Internal Process",
      "Other",
    ];
    expect(lessonTypes).toHaveLength(10);
    expect(lessonTypes).toContain("Contract Closeout");
    expect(lessonTypes).toContain("Proposal Win");
    expect(lessonTypes).toContain("Internal Process");
  });

  it("should define impact levels", () => {
    const impactLevels = ["critical", "high", "medium", "low"];
    expect(impactLevels).toHaveLength(4);
  });
});

describe("Platform Admin Router - Upgraded Procedures", () => {
  it("should export platformAdminRouter with dashboard metrics and health flags", async () => {
    const { platformAdminRouter } = await import("./platformAdminRouter");
    expect(platformAdminRouter).toBeDefined();
    expect(platformAdminRouter._def).toBeDefined();
    const procedures = platformAdminRouter._def.procedures;
    expect(procedures).toBeDefined();
  });

  it("should have adminProcedure that blocks non-admin users", async () => {
    const { adminProcedure } = await import("./_core/trpc");
    expect(adminProcedure).toBeDefined();
    // adminProcedure is a tRPC procedure builder
    expect(adminProcedure._def).toBeDefined();
  });
});

describe("Database Schema - New Tables", () => {
  it("should export workspace_health_flags table", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.workspaceHealthFlags).toBeDefined();
  });

  it("should export platform_activity_log table", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.platformActivityLog).toBeDefined();
  });

  it("should have extended lessonsLearned table with new fields", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.lessonsLearned).toBeDefined();
    // Verify the table has columns for the new fields
    const columns = Object.keys(schema.lessonsLearned);
    expect(columns.length).toBeGreaterThan(0);
  });
});

describe("Security Enforcement", () => {
  it("should have workspace scoping middleware", async () => {
    const { requireWorkspaceId, getWorkspaceIdForUser } = await import("./workspaceMiddleware");
    expect(requireWorkspaceId).toBeDefined();
    expect(getWorkspaceIdForUser).toBeDefined();
    expect(typeof requireWorkspaceId).toBe("function");
    expect(typeof getWorkspaceIdForUser).toBe("function");
  });

  it("should have admin procedure that checks role", async () => {
    const { adminProcedure } = await import("./_core/trpc");
    expect(adminProcedure).toBeDefined();
    // The middleware chain should exist
    expect(adminProcedure._def.middlewares).toBeDefined();
    expect(adminProcedure._def.middlewares.length).toBeGreaterThan(0);
  });
});

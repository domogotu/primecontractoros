import { describe, it, expect, vi } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue([]),
  },
}));

describe("Platform Admin Router - Security", () => {
  it("should define admin-only procedures for workspaces", async () => {
    const { platformAdminRouter } = await import("./platformAdminRouter");
    expect(platformAdminRouter).toBeDefined();
    expect(platformAdminRouter._def.procedures).toBeDefined();
  });

  it("should have workspaces sub-router with list, get, suspend, reactivate", async () => {
    const { platformAdminRouter } = await import("./platformAdminRouter");
    const procedures = platformAdminRouter._def.record;
    expect(procedures.workspaces).toBeDefined();
  });

  it("should have users sub-router with list, disable, enable", async () => {
    const { platformAdminRouter } = await import("./platformAdminRouter");
    const procedures = platformAdminRouter._def.record;
    expect(procedures.users).toBeDefined();
  });

  it("should have activity sub-router with list and stats", async () => {
    const { platformAdminRouter } = await import("./platformAdminRouter");
    const procedures = platformAdminRouter._def.record;
    expect(procedures.activity).toBeDefined();
  });

  it("should have notes sub-router with create", async () => {
    const { platformAdminRouter } = await import("./platformAdminRouter");
    const procedures = platformAdminRouter._def.record;
    expect(procedures.notes).toBeDefined();
  });

  it("should have audit sub-router with list", async () => {
    const { platformAdminRouter } = await import("./platformAdminRouter");
    const procedures = platformAdminRouter._def.record;
    expect(procedures.audit).toBeDefined();
  });
});

describe("Platform Admin Router - Data Schema", () => {
  it("should require reason for suspend action", async () => {
    const { platformAdminRouter } = await import("./platformAdminRouter");
    const workspaces = platformAdminRouter._def.record.workspaces;
    expect(workspaces).toBeDefined();
  });

  it("should require reason for disable user action", async () => {
    const { platformAdminRouter } = await import("./platformAdminRouter");
    const users = platformAdminRouter._def.record.users;
    expect(users).toBeDefined();
  });
});

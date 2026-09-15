import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the db module with chainable query builder
const mockExecute = vi.fn().mockResolvedValue([]);
const mockLimitResult = Object.assign(Promise.resolve([]), { execute: mockExecute, then: (resolve: any, reject?: any) => Promise.resolve([]).then(resolve, reject) });
const mockLimit = vi.fn().mockReturnValue(mockLimitResult);
const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit, execute: mockExecute });
const mockWhereResult = Object.assign(Promise.resolve([]), { orderBy: mockOrderBy, limit: mockLimit, execute: mockExecute, then: (resolve: any, reject?: any) => Promise.resolve([]).then(resolve, reject) });
const mockWhere = vi.fn().mockReturnValue(mockWhereResult);
const mockLeftJoin = vi.fn().mockReturnValue({ where: mockWhere, orderBy: mockOrderBy });
const mockFrom = vi.fn().mockReturnValue({ where: mockWhere, leftJoin: mockLeftJoin, orderBy: mockOrderBy });
const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });
const mockValues = vi.fn().mockResolvedValue([{ insertId: 1 }]);
const mockInsertValues = vi.fn().mockReturnValue(mockValues);
const mockInsert = vi.fn().mockReturnValue({ values: mockInsertValues });
const mockSet = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
const mockUpdate = vi.fn().mockReturnValue({ set: mockSet });

const mockDb = {
  select: mockSelect,
  from: mockFrom,
  insert: mockInsert,
  update: mockUpdate,
  query: {},
  execute: mockExecute,
};

vi.mock("./db", () => ({
  getDb: vi.fn(() => mockDb),
  createOpportunity: vi.fn().mockResolvedValue(1),
  getOpportunity: vi.fn().mockResolvedValue({ id: 1, title: "Test Opp", workspaceId: 1, status: "new" }),
  listOpportunities: vi.fn().mockResolvedValue([
    { id: 1, title: "Test Opp", status: "new", workspaceId: 1 },
  ]),
  updateOpportunity: vi.fn().mockResolvedValue(undefined),
  deleteOpportunity: vi.fn().mockResolvedValue(undefined),
  updateOpportunityStatus: vi.fn().mockResolvedValue(undefined),
  createProposal: vi.fn().mockResolvedValue(1),
  getProposal: vi.fn().mockResolvedValue({ id: 1, title: "Test Proposal", workspaceId: 1, status: "draft" }),
  listProposals: vi.fn().mockResolvedValue([
    { id: 1, title: "Test Proposal", status: "draft", workspaceId: 1 },
  ]),
  updateProposal: vi.fn().mockResolvedValue(undefined),
  deleteProposal: vi.fn().mockResolvedValue(undefined),
  updateProposalStatus: vi.fn().mockResolvedValue(undefined),
  createContract: vi.fn().mockResolvedValue(1),
  getContract: vi.fn().mockResolvedValue({ id: 1, title: "Test Contract", workspaceId: 1, status: "setup", health: "healthy" }),
  listContracts: vi.fn().mockResolvedValue([
    { id: 1, title: "Test Contract", status: "active", workspaceId: 1 },
  ]),
  updateContract: vi.fn().mockResolvedValue(undefined),
  deleteContract: vi.fn().mockResolvedValue(undefined),
  updateContractStatus: vi.fn().mockResolvedValue(undefined),
  updateContractHealth: vi.fn().mockResolvedValue(undefined),
  createAiRun: vi.fn(),
  createAiSuggestion: vi.fn(),
  getAiSuggestionsForRecord: vi.fn().mockResolvedValue([]),
  dismissAiSuggestion: vi.fn(),
  acceptAiSuggestion: vi.fn(),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

// Mock workspaceMiddleware
vi.mock("./workspaceMiddleware", () => ({
  requireWorkspaceId: vi.fn().mockResolvedValue(1),
  getWorkspaceIdForUser: vi.fn().mockResolvedValue(1),
  getUserWorkspaceRole: vi.fn().mockResolvedValue("owner"),
  canWrite: vi.fn().mockReturnValue(true),
  canDelete: vi.fn().mockReturnValue(true),
  canManageUsers: vi.fn().mockReturnValue(true),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({ choices: [{ message: { content: "[]" } }] }),
}));

// Mock billing service so plan limits don't block create operations in tests
vi.mock("./services/billing", () => ({
  checkPlanLimit: vi.fn().mockResolvedValue({ allowed: true, limit: -1, current: 0 }),
  getPlatformStripeConfig: vi.fn().mockReturnValue(null),
  getWorkspacePlanLimits: vi.fn().mockResolvedValue({ maxContracts: -1, maxProposals: -1, maxOpportunities: -1, maxTeamMembers: -1 }),
  getSubscriptionStatus: vi.fn().mockResolvedValue(null),
  createCheckoutSession: vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/test" }),
  PLAN_LIMITS: {
    starter: { maxContracts: 5, maxProposals: 10, maxOpportunities: 25, maxTeamMembers: 2 },
    growth: { maxContracts: 25, maxProposals: 50, maxOpportunities: 100, maxTeamMembers: 10 },
    advanced: { maxContracts: -1, maxProposals: -1, maxOpportunities: -1, maxTeamMembers: -1 },
    development: { maxContracts: -1, maxProposals: -1, maxOpportunities: -1, maxTeamMembers: -1 },
  },
}));

import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Opportunities CRUD", () => {
  let caller: ReturnType<typeof import("./routers").appRouter.createCaller>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { appRouter } = await import("./routers");
    caller = appRouter.createCaller(createTestContext());
  });

  it("should list opportunities", async () => {
    const result = await caller.opportunities.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  it("should get a single opportunity", async () => {
    const result = await caller.opportunities.get({ id: 1 });
    expect(result).toBeDefined();
    expect(result?.id).toBe(1);
    expect(result?.title).toBe("Test Opp");
  });

  it("should create an opportunity", async () => {
    const result = await caller.opportunities.create({
      title: "New Opportunity",
      agency: "DOD",
      naics: "541512",
    });
    expect(result).toEqual({ success: true });
  });

  it("should update an opportunity", async () => {
    const result = await caller.opportunities.update({
      id: 1,
      title: "Updated Opportunity",
      agency: "USAF",
    });
    expect(result).toEqual({ success: true });
  });

  it("should delete an opportunity", async () => {
    const result = await caller.opportunities.delete({ id: 1 });
    expect(result).toEqual({ success: true });
  });

  it("should update opportunity status", async () => {
    const result = await caller.opportunities.updateStatus({
      id: 1,
      status: "pursue",
    });
    expect(result).toEqual({ success: true });
  });

  it("should convert opportunity to proposal", async () => {
    const result = await caller.opportunities.convertToProposal({
      opportunityId: 1,
      proposalTitle: "Converted Proposal",
    });
    expect(result.success).toBe(true);
    expect(result.proposalId).toBeDefined();
  });

  it("should reject unauthenticated access", async () => {
    const { appRouter } = await import("./routers");
    const unauthCaller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    });

    await expect(unauthCaller.opportunities.list()).rejects.toThrow();
  });
});

describe("Proposals CRUD", () => {
  let caller: ReturnType<typeof import("./routers").appRouter.createCaller>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { appRouter } = await import("./routers");
    caller = appRouter.createCaller(createTestContext());
  });

  it("should list proposals", async () => {
    const result = await caller.proposals.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get a single proposal", async () => {
    const result = await caller.proposals.get({ id: 1 });
    expect(result).toBeDefined();
    expect(result?.id).toBe(1);
    expect(result?.title).toBe("Test Proposal");
  });

  it("should create a proposal", async () => {
    const result = await caller.proposals.create({
      title: "New Proposal",
    });
    expect(result.success).toBe(true);
    expect(result).toHaveProperty('id');
  });

  it("should update a proposal", async () => {
    const result = await caller.proposals.update({
      id: 1,
      title: "Updated Proposal",
    });
    expect(result).toEqual({ success: true });
  });

  it("should delete a proposal", async () => {
    const result = await caller.proposals.delete({ id: 1 });
    expect(result).toEqual({ success: true });
  });

  it("should update proposal status", async () => {
    const result = await caller.proposals.updateStatus({
      id: 1,
      status: "submitted",
    });
    expect(result).toEqual({ success: true });
  });

  it("should reject unauthenticated access", async () => {
    const { appRouter } = await import("./routers");
    const unauthCaller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    });

    await expect(unauthCaller.proposals.list()).rejects.toThrow();
  });
});

describe("Contracts CRUD", () => {
  let caller: ReturnType<typeof import("./routers").appRouter.createCaller>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { appRouter } = await import("./routers");
    caller = appRouter.createCaller(createTestContext());
  });

  it("should list contracts", async () => {
    const result = await caller.contracts.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get a single contract", async () => {
    const result = await caller.contracts.get({ id: 1 });
    expect(result).toBeDefined();
    expect(result?.id).toBe(1);
    expect(result?.title).toBe("Test Contract");
  });

  it("should create a contract", async () => {
    const result = await caller.contracts.create({
      title: "New Contract",
      contractType: "FFP",
      agency: "DOD",
    });
    expect(result).toEqual({ success: true });
  });

  it("should update a contract", async () => {
    const result = await caller.contracts.update({
      id: 1,
      title: "Updated Contract",
    });
    expect(result).toEqual({ success: true });
  });

  it("should delete a contract", async () => {
    const result = await caller.contracts.delete({ id: 1 });
    expect(result).toEqual({ success: true });
  });

  it("should update contract status", async () => {
    const result = await caller.contracts.updateStatus({
      id: 1,
      status: "active",
    });
    expect(result).toEqual({ success: true });
  });

  it("should update contract health", async () => {
    const result = await caller.contracts.updateHealth({
      id: 1,
      health: "at_risk",
    });
    expect(result).toEqual({ success: true });
  });

  it("should reject unauthenticated access", async () => {
    const { appRouter } = await import("./routers");
    const unauthCaller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    });

    await expect(unauthCaller.contracts.list()).rejects.toThrow();
  });
});

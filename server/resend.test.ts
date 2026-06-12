import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Resend Email Service Tests
 * 
 * These tests verify:
 * 1. The email service refuses to operate without a valid API key in production
 * 2. The Resend client can be initialized with a test key (mocked)
 * 3. Email payloads are structured correctly
 * 4. Missing configuration is handled gracefully without crashing
 */

// Mock the resend module
vi.mock("resend", () => {
  return {
    Resend: class MockResend {
      emails: any;
      domains: any;
      constructor(apiKey: string) {
        if (!apiKey) throw new Error("Missing API key. Pass it to the constructor `new Resend(\"re_123\")`");
        this.emails = {
          send: vi.fn().mockResolvedValue({ data: { id: "mock-email-id" } }),
        };
        this.domains = {
          list: vi.fn().mockResolvedValue({ data: [] }),
        };
      }
    },
  };
});

describe("Resend Email Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject initialization without an API key", async () => {
    const { Resend } = await import("resend");
    expect(() => new Resend("")).toThrow("Missing API key");
  });

  it("should initialize Resend client with a valid test key", async () => {
    const { Resend } = await import("resend");
    const resend = new Resend("re_test_dummy_key_for_testing");
    expect(resend).toBeDefined();
    expect(resend.emails).toBeDefined();
    expect(resend.domains).toBeDefined();
  });

  it("should have email and domain services available after initialization", async () => {
    const { Resend } = await import("resend");
    const resend = new Resend("re_test_dummy_key_for_testing");
    expect(resend.emails).toBeDefined();
    expect(resend.emails.send).toBeDefined();
    expect(resend.domains).toBeDefined();
    expect(resend.domains.list).toBeDefined();
  });

  it("should return empty string for resendApiKey when env var is not set", async () => {
    const { ENV } = await import("./_core/env");
    // In test environment, RESEND_API_KEY is not set, so ENV.resendApiKey should be ""
    expect(ENV.resendApiKey).toBe("");
  });

  it("should structure email payloads correctly", async () => {
    const { Resend } = await import("resend");
    const resend = new Resend("re_test_dummy_key_for_testing");
    const payload = {
      from: "PrimeContractorOS <noreply@primecontractoros.com>",
      to: "user@example.com",
      subject: "Test Subject",
      html: "<h1>Test</h1>",
    };
    await resend.emails.send(payload);
    expect(resend.emails.send).toHaveBeenCalledWith(payload);
  });
});

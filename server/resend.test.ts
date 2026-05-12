import { describe, it, expect } from "vitest";

describe("Resend API Key Validation", () => {
  it("should have RESEND_API_KEY configured", () => {
    const key = process.env.RESEND_API_KEY;
    expect(key).toBeDefined();
    expect(key).not.toBe("");
    expect(key!.startsWith("re_")).toBe(true);
  });

  it("should be able to initialize Resend client", async () => {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    expect(resend).toBeDefined();
  });

  it("should validate API key by fetching domains", async () => {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    // A lightweight API call to validate the key
    const { data, error } = await resend.domains.list();
    // If the key is valid, we should not get an auth error
    // (data may be empty array if no domains configured, that's fine)
    if (error) {
      // "missing_api_key" or "invalid_api_key" means the key is bad
      expect(error.name).not.toBe("missing_api_key");
      expect(error.name).not.toBe("invalid_api_key");
    } else {
      expect(data).toBeDefined();
    }
  });
});

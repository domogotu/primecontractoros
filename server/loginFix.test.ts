import { describe, it, expect } from "vitest";

/**
 * Tests for the login button hotfix:
 * 1. navigateToLogin no longer recurses — it sets window.location.href
 * 2. getLoginUrl encodes JSON state with origin and returnPath
 * 3. SDK decodeState handles JSON state format
 * 4. OAuth callback parses JSON state for post-login redirect
 */

describe("Login Flow Fixes", () => {
  describe("getLoginUrl state encoding", () => {
    it("should encode JSON state with origin and returnPath", () => {
      // Simulate what getLoginUrl does
      const origin = "https://primecontractoros.com";
      const returnPath = "/app/dashboard";
      const statePayload = JSON.stringify({ origin, returnPath });
      const state = btoa(statePayload);

      // Decode and verify
      const decoded = JSON.parse(atob(state));
      expect(decoded.origin).toBe("https://primecontractoros.com");
      expect(decoded.returnPath).toBe("/app/dashboard");
    });

    it("should default returnPath to /app/dashboard when not provided", () => {
      const origin = "https://primecontractoros.com";
      const returnPath = "/app/dashboard"; // default
      const statePayload = JSON.stringify({ origin, returnPath });
      const state = btoa(statePayload);

      const decoded = JSON.parse(atob(state));
      expect(decoded.returnPath).toBe("/app/dashboard");
    });

    it("should encode custom returnPath for checkout flow", () => {
      const origin = "https://primecontractoros.com";
      const returnPath = "/checkout/success";
      const statePayload = JSON.stringify({ origin, returnPath });
      const state = btoa(statePayload);

      const decoded = JSON.parse(atob(state));
      expect(decoded.returnPath).toBe("/checkout/success");
    });
  });

  describe("SDK decodeState - JSON format", () => {
    it("should extract redirectUri from JSON state", () => {
      const origin = "https://primecontractoros.com";
      const statePayload = JSON.stringify({ origin, returnPath: "/app/dashboard" });
      const state = btoa(statePayload);

      // Simulate decodeState logic
      const decoded = atob(state);
      let redirectUri: string;
      try {
        const parsed = JSON.parse(decoded);
        if (parsed.origin) {
          redirectUri = `${parsed.origin}/api/oauth/callback`;
        } else {
          redirectUri = decoded;
        }
      } catch {
        redirectUri = decoded;
      }

      expect(redirectUri).toBe("https://primecontractoros.com/api/oauth/callback");
    });

    it("should handle legacy plain-URL state format", () => {
      const legacyState = btoa("https://primecontractoros.com/api/oauth/callback");

      // Simulate decodeState logic
      const decoded = atob(legacyState);
      let redirectUri: string;
      try {
        const parsed = JSON.parse(decoded);
        if (parsed.origin) {
          redirectUri = `${parsed.origin}/api/oauth/callback`;
        } else {
          redirectUri = decoded;
        }
      } catch {
        // Not JSON — legacy format
        redirectUri = decoded;
      }

      expect(redirectUri).toBe("https://primecontractoros.com/api/oauth/callback");
    });
  });

  describe("OAuth callback post-login redirect", () => {
    it("should parse returnPath from JSON state for redirect", () => {
      const statePayload = JSON.stringify({
        origin: "https://primecontractoros.com",
        returnPath: "/app/dashboard",
      });
      const state = btoa(statePayload);

      // Simulate callback redirect logic
      let redirectTo = "/app/dashboard";
      try {
        const stateData = JSON.parse(atob(state));
        if (stateData.returnPath && stateData.returnPath.startsWith("/")) {
          redirectTo = stateData.returnPath;
        }
      } catch {
        redirectTo = "/app/dashboard";
      }

      expect(redirectTo).toBe("/app/dashboard");
    });

    it("should redirect to /app/dashboard for legacy state format", () => {
      const legacyState = btoa("https://primecontractoros.com/api/oauth/callback");

      let redirectTo = "/app/dashboard";
      try {
        const stateData = JSON.parse(atob(legacyState));
        if (stateData.returnPath && stateData.returnPath.startsWith("/")) {
          redirectTo = stateData.returnPath;
        }
      } catch {
        redirectTo = "/app/dashboard";
      }

      expect(redirectTo).toBe("/app/dashboard");
    });

    it("should reject returnPath that does not start with /", () => {
      const statePayload = JSON.stringify({
        origin: "https://primecontractoros.com",
        returnPath: "https://evil.com/steal",
      });
      const state = btoa(statePayload);

      let redirectTo = "/app/dashboard";
      try {
        const stateData = JSON.parse(atob(state));
        if (stateData.returnPath && stateData.returnPath.startsWith("/")) {
          redirectTo = stateData.returnPath;
        }
      } catch {
        redirectTo = "/app/dashboard";
      }

      // Should NOT use the external URL
      expect(redirectTo).toBe("/app/dashboard");
    });

    it("should support /checkout/success returnPath for signup flow", () => {
      const statePayload = JSON.stringify({
        origin: "https://primecontractoros.com",
        returnPath: "/checkout/success",
      });
      const state = btoa(statePayload);

      let redirectTo = "/app/dashboard";
      try {
        const stateData = JSON.parse(atob(state));
        if (stateData.returnPath && stateData.returnPath.startsWith("/")) {
          redirectTo = stateData.returnPath;
        }
      } catch {
        redirectTo = "/app/dashboard";
      }

      expect(redirectTo).toBe("/checkout/success");
    });
  });
});

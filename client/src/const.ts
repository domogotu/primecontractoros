export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Pre-warm the server before redirecting to OAuth.
 * This ensures the Cloud Run instance is ready when the OAuth callback arrives,
 * preventing authorization code expiration due to cold start delays.
 */
export const warmServer = async (): Promise<void> => {
  try {
    await fetch("/api/health", { method: "GET" });
  } catch {
    // Ignore errors - this is best-effort
  }
};

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = (returnPath?: string) => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  // Encode origin + optional returnPath in state so the callback knows where to redirect
  const statePayload = JSON.stringify({ origin: window.location.origin, returnPath: returnPath || "/app/dashboard" });
  const state = btoa(statePayload);
  // If VITE_OAUTH_PORTAL_URL is not configured (e.g. running outside the Manus
  // WebDev platform), fall back to the current origin so the app can still load
  // and show the login page without crashing.
  const baseUrl = oauthPortalUrl || window.location.origin;
  try {
    const url = new URL(`${baseUrl}/app-auth`);
    if (appId) {
      url.searchParams.set("appId", appId);
    }
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");
    return url.toString();
  } catch {
    // Last-resort fallback: return a relative login path
    return `/login`;
  }
};

/**
 * Navigate to login after warming the server.
 * Use this instead of directly setting window.location to the login URL.
 */
export const navigateToLogin = async (returnPath?: string): Promise<void> => {
  // Warm the server first to avoid cold start on callback
  await warmServer();
  window.location.href = getLoginUrl(returnPath);
};

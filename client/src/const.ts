export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

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

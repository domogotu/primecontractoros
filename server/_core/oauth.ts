import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

/**
 * Retry wrapper for the token exchange.
 * OAuth codes can expire if the server cold-starts or the DB connection is slow.
 * This retries once after a short delay to handle transient failures.
 */
async function exchangeWithRetry(code: string, state: string, maxRetries = 1) {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await sdk.exchangeCodeForToken(code, state);
    } catch (error: any) {
      lastError = error;
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || "";
      // Only retry on 401 "invalid or expired" - not on other errors
      if (status === 401 && message.includes("invalid or expired") && attempt < maxRetries) {
        console.log(`[OAuth] Token exchange attempt ${attempt + 1} failed, retrying in 500ms...`);
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export function registerOAuthRoutes(app: Express) {
  // Health/warm-up endpoint: keeps the Cloud Run instance warm
  // Frontend calls this before redirecting to OAuth portal
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // Debug endpoint: returns redacted env config to help diagnose OAuth issues
  app.get("/api/debug-oauth", (_req: Request, res: Response) => {
    const appId = ENV.appId;
    const oauthUrl = ENV.oAuthServerUrl;
    const jwtSecret = ENV.cookieSecret;
    res.json({
      appId: appId ? `${appId.slice(0, 6)}...${appId.slice(-4)}` : "(not set)",
      oAuthServerUrl: oauthUrl || "(not set)",
      jwtSecretSet: !!jwtSecret,
      nodeEnv: process.env.NODE_ENV,
      viteAppId: process.env.VITE_APP_ID
        ? `${process.env.VITE_APP_ID.slice(0, 6)}...${process.env.VITE_APP_ID.slice(-4)}`
        : "(not set)",
      oauthServerUrl: process.env.OAUTH_SERVER_URL || "(not set)",
    });
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    // Log the decoded redirect URI from state for debugging
    let decodedState = "(decode failed)";
    try {
      decodedState = atob(state);
    } catch {}
    console.log("[OAuth] Callback received — redirectUri from state:", decodedState);

    try {
      const tokenResponse = await exchangeWithRetry(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Parse state to determine post-login redirect
      let redirectTo = "/app/dashboard";
      try {
        const stateData = JSON.parse(atob(state));
        if (stateData.returnPath && stateData.returnPath.startsWith("/")) {
          redirectTo = stateData.returnPath;
        }
      } catch {
        // If state is just a URL (legacy format), redirect to dashboard
        redirectTo = "/app/dashboard";
      }
      res.redirect(302, redirectTo);
    } catch (error: any) {
      // Log full error details including response body from OAuth server
      const axiosResponse = error?.response;
      console.error("[OAuth] Callback failed", {
        message: error?.message,
        status: axiosResponse?.status,
        responseData: axiosResponse?.data,
        decodedState,
        appId: ENV.appId ? `${ENV.appId.slice(0, 6)}...` : "(not set)",
      });

      const message = error instanceof Error ? error.message : String(error);
      const detail = axiosResponse?.data?.message ?? message;

      // If the code expired, show a user-friendly page that auto-retries login
      if (axiosResponse?.status === 401 && detail.includes("invalid or expired")) {
        res.status(401).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Login - Retry</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; }
              .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.07); text-align: center; max-width: 400px; }
              h2 { color: #1e293b; margin-bottom: 0.5rem; }
              p { color: #64748b; line-height: 1.6; }
              .btn { display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: #2563eb; color: white; border-radius: 8px; text-decoration: none; font-weight: 500; transition: background 0.2s; }
              .btn:hover { background: #1d4ed8; }
              .spinner { display: inline-block; width: 20px; height: 20px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 1rem; }
              @keyframes spin { to { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="spinner"></div>
              <h2>Session Expired</h2>
              <p>Your login session timed out. Redirecting you to sign in again...</p>
              <a class="btn" href="/" id="retry-btn">Sign In Again</a>
            </div>
            <script>
              // Auto-redirect to home after 2 seconds so user can click Sign In again
              setTimeout(() => { window.location.href = '/'; }, 2500);
            </script>
          </body>
          </html>
        `);
        return;
      }

      res.status(500).json({ error: "OAuth callback failed", detail });
    }
  });
}

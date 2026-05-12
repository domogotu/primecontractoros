import Stripe from "stripe";
import { getDb } from "../db";
import { workspaceSettings, subscriptions, plans, workspaces } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret?: string;
}

export async function getStripeConfig(workspaceId: number): Promise<StripeConfig | null> {
  const db = await getDb();
  if (!db) return null;
  const settings = await db
    .select()
    .from(workspaceSettings)
    .where(eq(workspaceSettings.workspaceId, workspaceId));

  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    if (s.settingValue) settingsMap[s.settingKey] = s.settingValue;
  }

  const secretKey = settingsMap["stripe_secret_key"];
  const publishableKey = settingsMap["stripe_publishable_key"];

  if (!secretKey || !publishableKey) return null;

  return {
    secretKey,
    publishableKey,
    webhookSecret: settingsMap["stripe_webhook_secret"],
  };
}

// Platform-level Stripe config (stored in workspace 0 or env vars)
export function getPlatformStripeConfig(): StripeConfig | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY;
  if (!secretKey || !publishableKey) return null;
  return {
    secretKey,
    publishableKey,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  };
}

function createStripeClient(config: StripeConfig): Stripe {
  return new Stripe(config.secretKey, { apiVersion: "2025-04-30.basil" as any });
}

export interface PlanLimits {
  maxContracts: number; // -1 = unlimited
  maxProposals: number;
  maxOpportunities: number;
  maxTeamMembers: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  starter: { maxContracts: 5, maxProposals: 10, maxOpportunities: 25, maxTeamMembers: 2 },
  growth: { maxContracts: 25, maxProposals: 50, maxOpportunities: 100, maxTeamMembers: 10 },
  advanced: { maxContracts: -1, maxProposals: -1, maxOpportunities: -1, maxTeamMembers: -1 },
  // Development mode (no Stripe configured)
  development: { maxContracts: -1, maxProposals: -1, maxOpportunities: -1, maxTeamMembers: -1 },
};

export async function getWorkspacePlanLimits(workspaceId: number): Promise<PlanLimits> {
  const config = getPlatformStripeConfig();
  if (!config) {
    // Development mode - all features unlocked
    return PLAN_LIMITS.development;
  }

  const db = await getDb();
  if (!db) return PLAN_LIMITS.development;

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.workspaceId, workspaceId), eq(subscriptions.status, "active")));

  if (!sub) return PLAN_LIMITS.starter; // Default to starter if no subscription

  const [plan] = await db.select().from(plans).where(eq(plans.id, sub.planId));
  if (!plan) return PLAN_LIMITS.starter;

  const planName = plan.name.toLowerCase();
  return PLAN_LIMITS[planName] || PLAN_LIMITS.starter;
}

export async function checkPlanLimit(
  workspaceId: number,
  entityType: "contracts" | "proposals" | "opportunities" | "teamMembers",
  currentCount: number
): Promise<{ allowed: boolean; limit: number; current: number }> {
  const limits = await getWorkspacePlanLimits(workspaceId);
  const limitKey = `max${entityType.charAt(0).toUpperCase() + entityType.slice(1)}` as keyof PlanLimits;
  const limit = limits[limitKey];

  if (limit === -1) return { allowed: true, limit: -1, current: currentCount };
  return { allowed: currentCount < limit, limit, current: currentCount };
}

export async function createCheckoutSession(
  workspaceId: number,
  planId: number,
  successUrl: string,
  cancelUrl: string
): Promise<{ url: string | null; error?: string }> {
  const config = getPlatformStripeConfig();
  if (!config) return { url: null, error: "Stripe not configured" };

  const db = await getDb();
  if (!db) return { url: null, error: "Database not available" };

  const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
  if (!plan) return { url: null, error: "Plan not found" };

  try {
    const stripe = createStripeClient(config);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: plan.name, description: plan.description || undefined },
            recurring: { interval: "month" },
            unit_amount: Math.round(parseFloat(plan.monthlyPrice || "0") * 100),
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { workspaceId: String(workspaceId), planId: String(planId) },
    });
    return { url: session.url };
  } catch (error: any) {
    return { url: null, error: error.message };
  }
}

export async function getSubscriptionStatus(workspaceId: number) {
  const db = await getDb();
  if (!db) return null;

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.workspaceId, workspaceId));

  if (!sub) return null;

  const [plan] = await db.select().from(plans).where(eq(plans.id, sub.planId));
  return { ...sub, plan };
}

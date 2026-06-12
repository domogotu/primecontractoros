/**
 * accessGating.ts
 *
 * Central access-gating logic for PrimeContractorOS.
 *
 * Determines whether a workspace has valid access to the application based on:
 *   - Active paid subscription
 *   - Active trial
 *   - Platform-owner-approved grace period
 *   - Platform-owner-approved override
 *   - Internal admin/owner account
 *
 * This module is the single source of truth for access decisions.
 */

import { getDb } from "./db";
import {
  accessStates,
  subscriptions,
  platformOverrides,
  platformBilling,
  platformAuditLog,
  billingEvents,
  workspaces,
  users,
} from "../drizzle/schema";
import { eq, and, desc, or, isNull, gt } from "drizzle-orm";
import type { AccessState } from "../drizzle/schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AccessStatus =
  | "active_paid"
  | "trial_active"
  | "grace"
  | "override"
  | "admin_bypass"
  | "pending_payment"
  | "past_due"
  | "suspended"
  | "canceled"
  | "no_access";

export interface AccessResult {
  allowed: boolean;
  status: AccessStatus;
  reason?: string;
  /** ISO string of when access expires, if applicable */
  expiresAt?: string;
}

// ─── Core helpers ─────────────────────────────────────────────────────────────

/**
 * Fetch the current accessState record for a workspace.
 * Returns null if no record exists.
 */
export async function getAccessState(workspaceId: number): Promise<AccessState | null> {
  const db = await getDb();
  if (!db) return null;
  const [record] = await db
    .select()
    .from(accessStates)
    .where(eq(accessStates.workspaceId, workspaceId))
    .orderBy(desc(accessStates.changedAt))
    .limit(1);
  return record ?? null;
}

/**
 * Create or update the accessState record for a workspace.
 * Logs a billingEvent for the state change.
 */
export async function updateAccessState(
  workspaceId: number,
  newState: AccessState["state"],
  reason?: string,
  changedBy?: number,
  _expiresAt?: Date
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const existing = await getAccessState(workspaceId);
  const previousState = existing?.state ?? null;

  if (existing) {
    await db
      .update(accessStates)
      .set({
        state: newState,
        previousState: previousState ?? undefined,
        changedAt: new Date(),
        changedBy: changedBy ?? null,
        reason: reason ?? null,
      })
      .where(eq(accessStates.id, existing.id));
  } else {
    await db.insert(accessStates).values({
      workspaceId,
      state: newState,
      previousState: previousState ?? undefined,
      changedAt: new Date(),
      changedBy: changedBy ?? null,
      reason: reason ?? null,
    });
  }

  // Log billing event for audit trail
  await db.insert(billingEvents).values({
    workspaceId,
    eventType: "access_state_change",
    oldState: previousState ?? undefined,
    newState,
    reason: reason ?? null,
    adminId: changedBy ?? null,
    metadata: JSON.stringify({ changedAt: new Date().toISOString() }),
  });
}

/**
 * Determine whether a given accessState value represents valid (allowed) access.
 */
export function isAccessStateValid(state: AccessState["state"] | null | undefined): boolean {
  if (!state) return false;
  return ["trial_active", "active_paid", "limited_access"].includes(state);
}

// ─── Full access evaluation ───────────────────────────────────────────────────

/**
 * Evaluate whether a workspace has valid access to the application.
 *
 * Priority order:
 *   1. Admin/owner user role bypass
 *   2. Active platform override (feature = "access_bypass" or "grace_period")
 *   3. Active subscription (status = active or trialing)
 *   4. accessStates record (trial_active, active_paid, limited_access)
 *   5. platformBilling trial still active
 *   6. Deny
 */
export async function evaluateAccess(
  workspaceId: number,
  userId?: number
): Promise<AccessResult> {
  const db = await getDb();
  if (!db) {
    // If DB is unavailable, allow through to avoid blocking the app entirely
    return { allowed: true, status: "admin_bypass", reason: "Database unavailable — access permitted" };
  }

  // 1. Admin/owner bypass — platform admins always get through
  if (userId) {
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (user?.role === "admin") {
      return { allowed: true, status: "admin_bypass", reason: "Platform admin account" };
    }
  }

  // 2. Platform override — check for active access_bypass or grace_period override
  const now = new Date();
  const [override] = await db
    .select()
    .from(platformOverrides)
    .where(
      and(
        eq(platformOverrides.workspaceId, workspaceId),
        eq(platformOverrides.isActive, true),
        or(
          eq(platformOverrides.feature, "access_bypass"),
          eq(platformOverrides.feature, "grace_period")
        )
      )
    )
    .limit(1);

  if (override) {
    // Check expiry
    if (!override.expiresAt || override.expiresAt > now) {
      const status: AccessStatus = override.feature === "grace_period" ? "grace" : "override";
      return {
        allowed: true,
        status,
        reason: override.reason ?? `Platform override: ${override.feature}`,
        expiresAt: override.expiresAt?.toISOString(),
      };
    }
  }

  // 3. Active Stripe subscription
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.workspaceId, workspaceId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  if (sub) {
    if (sub.status === "active") {
      return { allowed: true, status: "active_paid", reason: "Active subscription" };
    }
    if (sub.status === "trialing") {
      const trialEnd = (sub as any).trialEnd ? new Date((sub as any).trialEnd) : null;
      if (!trialEnd || trialEnd > now) {
        return {
          allowed: true,
          status: "trial_active",
          reason: "Active trial subscription",
          expiresAt: trialEnd?.toISOString(),
        };
      }
    }
    if (sub.status === "past_due") {
      return { allowed: false, status: "past_due", reason: "Subscription payment past due" };
    }
    if (sub.status === "canceled") {
      return { allowed: false, status: "canceled", reason: "Subscription canceled" };
    }
  }

  // 4. accessStates record
  const accessState = await getAccessState(workspaceId);
  if (accessState) {
    if (accessState.state === "active_paid") {
      return { allowed: true, status: "active_paid", reason: "Access state: active_paid" };
    }
    if (accessState.state === "trial_active") {
      return { allowed: true, status: "trial_active", reason: "Access state: trial_active" };
    }
    if (accessState.state === "limited_access") {
      return { allowed: true, status: "trial_active", reason: "Access state: limited_access" };
    }
    if (accessState.state === "suspended") {
      return { allowed: false, status: "suspended", reason: accessState.reason ?? "Workspace suspended" };
    }
    if (accessState.state === "canceled") {
      return { allowed: false, status: "canceled", reason: accessState.reason ?? "Subscription canceled" };
    }
    if (accessState.state === "past_due") {
      return { allowed: false, status: "past_due", reason: accessState.reason ?? "Payment past due" };
    }
  }

  // 5. platformBilling trial still active
  const [pb] = await db
    .select()
    .from(platformBilling)
    .where(eq(platformBilling.workspaceId, workspaceId))
    .limit(1);

  if (pb) {
    if (pb.status === "active") {
      return { allowed: true, status: "active_paid", reason: "Platform billing: active" };
    }
    if (pb.status === "trial") {
      const trialEnd = pb.trialEndsAt ? new Date(pb.trialEndsAt) : null;
      if (!trialEnd || trialEnd > now) {
        return {
          allowed: true,
          status: "trial_active",
          reason: "Platform billing: trial active",
          expiresAt: trialEnd?.toISOString(),
        };
      }
    }
  }

  // 6. No valid access found
  return { allowed: false, status: "no_access", reason: "No active subscription or trial" };
}

/**
 * Quick boolean check — is this workspace allowed to access the app?
 * Uses evaluateAccess internally.
 */
export async function isWorkspaceAccessAllowed(
  workspaceId: number,
  userId?: number
): Promise<boolean> {
  const result = await evaluateAccess(workspaceId, userId);
  return result.allowed;
}

/**
 * Log a billing/access audit entry to platformAuditLog.
 */
export async function logBillingAudit(
  workspaceId: number,
  action: string,
  performedBy: number,
  reason?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(platformAuditLog).values({
    action,
    targetType: "billing",
    targetId: workspaceId,
    performedBy,
    reason: reason ?? null,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });
}

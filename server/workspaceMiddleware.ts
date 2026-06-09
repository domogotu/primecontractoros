import { TRPCError } from "@trpc/server";
import { UNAUTHED_ERR_MSG } from "@shared/const";
import { getDb } from "./db";
import { workspaces, workspaceMembers } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export type WorkspaceRoleType = "owner" | "admin" | "contract_manager" | "finance_user" | "member" | "viewer";

/**
 * Gets the workspace ID for a user.
 * First checks if user owns a workspace, then checks workspace membership.
 * Returns the workspace they have access to, or null if none.
 */
export async function getWorkspaceIdForUser(userId: number): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  // First check if user owns a workspace
  const [ownedWs] = await db.select({ id: workspaces.id }).from(workspaces).where(eq(workspaces.ownerId, userId)).limit(1);
  if (ownedWs) return ownedWs.id;
  // Then check workspace membership
  const [membership] = await db.select({ workspaceId: workspaceMembers.workspaceId }).from(workspaceMembers).where(eq(workspaceMembers.userId, userId)).limit(1);
  return membership?.workspaceId ?? null;
}

/**
 * Helper function for use in procedures that need workspaceId.
 * Throws if user has no workspace.
 */
export async function requireWorkspaceId(userId: number): Promise<number> {
  const wsId = await getWorkspaceIdForUser(userId);
  if (!wsId) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "No workspace found. Please complete onboarding first.",
    });
  }
  return wsId;
}

// Role-based access helpers
export async function getUserWorkspaceRole(userId: number, workspaceId: number): Promise<WorkspaceRoleType> {
  const db = await getDb();
  if (!db) return "member";

  // Check if user is workspace owner
  const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId));
  if (ws && ws.ownerId === userId) return "owner";

  // Check workspace members table
  const [member] = await db.select().from(workspaceMembers).where(
    and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId))
  );
  if (member) return member.role as WorkspaceRoleType;

  return "member"; // default for workspace owner who isn't in members table
}

export function canWrite(role: string): boolean {
  return ["owner", "admin", "contract_manager", "finance_user", "member"].includes(role);
}

export function canDelete(role: string): boolean {
  return ["owner", "admin"].includes(role);
}

export function canManageUsers(role: string): boolean {
  return role === "owner" || role === "admin";
}

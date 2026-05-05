import { TRPCError } from "@trpc/server";
import { UNAUTHED_ERR_MSG } from "@shared/const";
import { getDb } from "./db";
import { workspaces, workspaceMembers } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Gets the workspace ID for a user. Returns the workspace they own.
 * If user has no workspace, returns null.
 */
export async function getWorkspaceIdForUser(userId: number): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  const [ws] = await db.select({ id: workspaces.id }).from(workspaces).where(eq(workspaces.ownerId, userId)).limit(1);
  return ws?.id ?? null;
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
export async function getUserWorkspaceRole(userId: number, workspaceId: number): Promise<"owner" | "admin" | "member" | "viewer"> {
  const db = await getDb();
  if (!db) return "member";
  
  // Check if user is workspace owner
  const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId));
  if (ws && ws.ownerId === userId) return "owner";
  
  // Check workspace members table
  const [member] = await db.select().from(workspaceMembers).where(
    and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId))
  );
  if (member) return member.role;
  
  return "member"; // default for workspace owner who isn't in members table
}

export function canWrite(role: string): boolean {
  return ["owner", "admin", "member"].includes(role);
}

export function canDelete(role: string): boolean {
  return ["owner", "admin"].includes(role);
}

export function canManageUsers(role: string): boolean {
  return role === "owner";
}

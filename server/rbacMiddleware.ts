/**
 * RBAC Middleware for tRPC procedures
 * 
 * Provides reusable middleware that checks workspace-level permissions
 * before allowing mutations to proceed.
 */

import { TRPCError } from "@trpc/server";
import { getUserWorkspaceRole, canWrite, canDelete, canManageUsers } from "./workspaceMiddleware";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { hasPermission as hasRolePermission, type PermissionAction } from "./permissions";

export type WorkspacePermission = "read" | "write" | "delete" | "manage_users" | "manage_settings";

/**
 * Check if a workspace role satisfies a given permission level
 */
export function checkPermission(role: string, permission: WorkspacePermission): boolean {
  switch (permission) {
    case "read":
      return true; // all roles can read
    case "write":
      return canWrite(role);
    case "delete":
      return canDelete(role);
    case "manage_users":
      return canManageUsers(role);
    case "manage_settings":
      return role === "owner" || role === "admin";
    default:
      return false;
  }
}

/**
 * Enforce a permission for the current user in their workspace.
 * Throws FORBIDDEN if the user's workspace role doesn't satisfy the permission.
 */
export async function enforcePermission(
  userId: number,
  permission: WorkspacePermission
): Promise<{ wsId: number; role: string }> {
  const wsId = await requireWorkspaceId(userId);
  const role = await getUserWorkspaceRole(userId, wsId);
  
  if (!checkPermission(role, permission)) {
    const friendlyMessages: Record<WorkspacePermission, string> = {
      read: "You do not have permission to view this resource.",
      write: "You do not have permission to create or edit records. Contact your workspace admin.",
      delete: "You do not have permission to delete records. Only owners and admins can delete.",
      manage_users: "Only workspace owners and admins can manage users.",
      manage_settings: "Only owners and admins can manage workspace settings.",
    };
    throw new TRPCError({
      code: "FORBIDDEN",
      message: friendlyMessages[permission],
    });
  }
  
  return { wsId, role };
}

/**
 * Enforce a domain-specific permission action.
 * Uses the fine-grained permissions map from permissions.ts.
 * Example: enforceAction(userId, "manage_contracts") — only owner, admin, contract_manager
 */
export async function enforceAction(
  userId: number,
  action: PermissionAction
): Promise<{ wsId: number; role: string }> {
  const wsId = await requireWorkspaceId(userId);
  const role = await getUserWorkspaceRole(userId, wsId);
  if (!hasRolePermission(role, action)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `You do not have permission to perform this action: ${action.replace(/_/g, " ")}.`,
    });
  }
  return { wsId, role };
}

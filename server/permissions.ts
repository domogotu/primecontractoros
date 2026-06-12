/**
 * Phase 7 — Workspace Role Permissions Helper
 *
 * Maps the 6 workspace roles to allowed action categories.
 * Used by procedures to enforce role-based access control.
 */

export type WorkspaceRole = "owner" | "admin" | "contract_manager" | "finance_user" | "member" | "viewer";

export type ActionCategory =
  | "manage_workspace"
  | "manage_team"
  | "manage_opportunities"
  | "manage_proposals"
  | "manage_contracts"
  | "manage_requirements"
  | "manage_deliverables"
  | "manage_deadlines"
  | "manage_files"
  | "manage_subcontractors"
  | "manage_closeout"
  | "manage_invoices"
  | "manage_payments"
  | "manage_finance_reports"
  | "manage_financial_files"
  | "view_records"
  | "create_records"
  | "edit_records"
  | "delete_records";

const ROLE_ACTIONS: Record<WorkspaceRole, ActionCategory[]> = {
  owner: [
    "manage_workspace", "manage_team",
    "manage_opportunities", "manage_proposals", "manage_contracts",
    "manage_requirements", "manage_deliverables", "manage_deadlines",
    "manage_files", "manage_subcontractors", "manage_closeout",
    "manage_invoices", "manage_payments", "manage_finance_reports", "manage_financial_files",
    "view_records", "create_records", "edit_records", "delete_records",
  ],
  admin: [
    "manage_team",
    "manage_opportunities", "manage_proposals", "manage_contracts",
    "manage_requirements", "manage_deliverables", "manage_deadlines",
    "manage_files", "manage_subcontractors", "manage_closeout",
    "manage_invoices", "manage_payments", "manage_finance_reports", "manage_financial_files",
    "view_records", "create_records", "edit_records", "delete_records",
  ],
  contract_manager: [
    "manage_opportunities", "manage_proposals", "manage_contracts",
    "manage_requirements", "manage_deliverables", "manage_deadlines",
    "manage_files", "manage_subcontractors", "manage_closeout",
    "view_records", "create_records", "edit_records", "delete_records",
  ],
  finance_user: [
    "manage_invoices", "manage_payments", "manage_finance_reports", "manage_financial_files",
    "view_records", "create_records", "edit_records",
  ],
  member: [
    "view_records", "create_records", "edit_records",
  ],
  viewer: [
    "view_records",
  ],
};

/**
 * Check if a workspace role has permission for a given action category.
 */
export function roleHasPermission(role: WorkspaceRole | string, action: ActionCategory): boolean {
  const actions = ROLE_ACTIONS[role as WorkspaceRole];
  if (!actions) return false;
  return actions.includes(action);
}

/**
 * Check if a role can manage team (invite, role change, remove).
 * Only owner and admin can manage team.
 */
export function canManageTeam(role: string): boolean {
  return role === "owner" || role === "admin";
}

/**
 * Check if a role can manage workspace settings.
 * Only owner can manage workspace.
 */
export function canManageWorkspace(role: string): boolean {
  return role === "owner";
}

/**
 * Get all allowed action categories for a role.
 */
export function getAllowedActions(role: WorkspaceRole | string): ActionCategory[] {
  return ROLE_ACTIONS[role as WorkspaceRole] || [];
}

/**
 * Validate that a role string is a valid workspace role.
 */
export function isValidRole(role: string): role is WorkspaceRole {
  return ["owner", "admin", "contract_manager", "finance_user", "member", "viewer"].includes(role);
}

// Alias for use in rbacMiddleware
export type PermissionAction = ActionCategory;
export const hasPermission = roleHasPermission;

/**
 * Get roles that can be assigned by a given role.
 * Owner can assign all roles except owner.
 * Admin can assign contract_manager, finance_user, member, viewer.
 */
export function getAssignableRoles(currentRole: string): WorkspaceRole[] {
  if (currentRole === "owner") {
    return ["admin", "contract_manager", "finance_user", "member", "viewer"];
  }
  if (currentRole === "admin") {
    return ["contract_manager", "finance_user", "member", "viewer"];
  }
  return [];
}

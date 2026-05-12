/**
 * Role-Based Access Control (RBAC) System
 * 
 * Roles hierarchy:
 * - platform_owner: Full system access (the owner of the platform)
 * - workspace_admin: Full workspace access (workspace owner/admin)
 * - trusted_admin: Can manage records but not billing/subscription
 * - standard_user: Can create/edit own records, view shared records
 * - read_only: Can only view records
 * 
 * Permissions are checked at the procedure level using middleware.
 */

import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { auditLogs } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export type Role = "platform_owner" | "workspace_admin" | "trusted_admin" | "standard_user" | "read_only";

export type Permission =
  | "view_records"
  | "create_records"
  | "edit_records"
  | "delete_records"
  | "archive_records"
  | "upload_files"
  | "mark_governing"
  | "run_ai_scans"
  | "approve_ai_findings"
  | "create_invoices"
  | "manage_users"
  | "manage_billing"
  | "access_audit_log"
  | "manage_workspace_settings"
  | "platform_admin";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  platform_owner: [
    "view_records", "create_records", "edit_records", "delete_records", "archive_records",
    "upload_files", "mark_governing", "run_ai_scans", "approve_ai_findings",
    "create_invoices", "manage_users", "manage_billing", "access_audit_log",
    "manage_workspace_settings", "platform_admin",
  ],
  workspace_admin: [
    "view_records", "create_records", "edit_records", "delete_records", "archive_records",
    "upload_files", "mark_governing", "run_ai_scans", "approve_ai_findings",
    "create_invoices", "manage_users", "manage_billing", "access_audit_log",
    "manage_workspace_settings",
  ],
  trusted_admin: [
    "view_records", "create_records", "edit_records", "delete_records", "archive_records",
    "upload_files", "mark_governing", "run_ai_scans", "approve_ai_findings",
    "create_invoices", "manage_users", "access_audit_log",
  ],
  standard_user: [
    "view_records", "create_records", "edit_records",
    "upload_files", "run_ai_scans",
  ],
  read_only: [
    "view_records",
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role | string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role as Role];
  if (!perms) return false;
  return perms.includes(permission);
}

/**
 * Get effective role for a user in a workspace context
 */
export function getEffectiveRole(user: { role?: string; id?: number }, ownerOpenId?: string): Role {
  // Platform owner check
  if (user.role === "admin") return "platform_owner";
  // Default to standard_user
  return "standard_user";
}

/**
 * Require a specific permission - throws FORBIDDEN if not met
 */
export function requirePermission(userRole: Role | string, permission: Permission): void {
  if (!hasPermission(userRole as Role, permission)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `You do not have the required permission: ${permission}`,
    });
  }
}

/**
 * Log an audit event
 */
export async function logAudit(params: {
  workspaceId?: number;
  userId?: number;
  actionType: string;
  targetType: string;
  targetId?: number;
  oldValue?: string;
  newValue?: string;
  note?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    const db = (await getDb())!;
    await db.insert(auditLogs).values({
      workspaceId: params.workspaceId || null,
      userId: params.userId || null,
      actionType: params.actionType,
      targetType: params.targetType,
      targetId: params.targetId || null,
      oldValue: params.oldValue || null,
      newValue: params.newValue || null,
      reason: params.note || null,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
    });
  } catch (err) {
    console.error("[Audit] Failed to log audit event:", err);
    // Don't throw - audit logging should never break the main flow
  }
}

/**
 * Archive a record (soft delete)
 */
export async function archiveRecord(
  table: any,
  recordId: number,
  userId: number,
  workspaceId?: number,
  tableName?: string
): Promise<void> {
  const db = (await getDb())!;
  await db.update(table).set({ archivedAt: new Date() }).where(eq(table.id, recordId));
  await logAudit({
    workspaceId,
    userId,
    actionType: "archive",
    targetType: tableName || "record",
    targetId: recordId,
  });
}

/**
 * Restore an archived record
 */
export async function restoreRecord(
  table: any,
  recordId: number,
  userId: number,
  workspaceId?: number,
  tableName?: string
): Promise<void> {
  const db = (await getDb())!;
  await db.update(table).set({ archivedAt: null }).where(eq(table.id, recordId));
  await logAudit({
    workspaceId,
    userId,
    actionType: "restore",
    targetType: tableName || "record",
    targetId: recordId,
  });
}

/**
 * File upload validation
 */
export const FILE_UPLOAD_CONFIG = {
  maxSizeBytes: 25 * 1024 * 1024, // 25MB
  allowedMimeTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
  ],
  blockedExtensions: [".exe", ".bat", ".cmd", ".sh", ".ps1", ".vbs", ".js", ".mjs"],
};

export function validateFileUpload(filename: string, mimeType: string, sizeBytes: number): { valid: boolean; error?: string } {
  if (sizeBytes > FILE_UPLOAD_CONFIG.maxSizeBytes) {
    return { valid: false, error: `File too large. Maximum size is ${FILE_UPLOAD_CONFIG.maxSizeBytes / 1024 / 1024}MB.` };
  }
  const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
  if (FILE_UPLOAD_CONFIG.blockedExtensions.includes(ext)) {
    return { valid: false, error: `File type ${ext} is not allowed for security reasons.` };
  }
  if (!FILE_UPLOAD_CONFIG.allowedMimeTypes.includes(mimeType)) {
    return { valid: false, error: `File type ${mimeType} is not supported.` };
  }
  return { valid: true };
}

/**
 * Sanitize filename for storage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .substring(0, 200);
}

// @ts-nocheck
/**
 * Phase 7 — Invite Router
 *
 * Provides: create, list, accept, revoke, resend invite procedures.
 * Accept is a public procedure (user may not be logged in yet when clicking invite link).
 */
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { invites, workspaceMembers, users, workspaces, auditLogs } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireWorkspaceId, getUserWorkspaceRole } from "./workspaceMiddleware";
import { canManageTeam } from "./permissions";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";

/** Generate a secure invite token */
function generateToken(): string {
  return randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "").slice(0, 16);
}

/** Default invite expiry: 7 days */
function getExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d;
}

/** Log audit event for invite actions */
async function logInviteAudit(params: {
  workspaceId: number;
  userId: number;
  actionType: string;
  targetId?: number;
  newValue?: string;
}) {
  try {
    const db = await getDb();
    await db.insert(auditLogs).values({
      workspaceId: params.workspaceId,
      userId: params.userId,
      actionType: params.actionType,
      targetType: "invite",
      targetId: params.targetId || null,
      newValue: params.newValue || null,
    });
  } catch (e) {
    console.error("[Audit] Failed to log invite audit:", e);
  }
}

export const inviteRouter = router({
  /** List all invites for the current workspace */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    const results = await db
      .select({
        id: invites.id,
        email: invites.email,
        role: invites.role,
        status: invites.status,
        token: invites.token,
        invitedBy: invites.invitedBy,
        expiresAt: invites.expiresAt,
        acceptedAt: invites.acceptedAt,
        createdAt: invites.createdAt,
      })
      .from(invites)
      .where(eq(invites.workspaceId, wsId))
      .orderBy(desc(invites.createdAt));

    // Check for expired invites and mark them
    const now = new Date();
    const processed = results.map((inv) => {
      if (inv.status === "pending" && inv.expiresAt && new Date(inv.expiresAt) < now) {
        return { ...inv, status: "expired" };
      }
      return inv;
    });
    return processed;
  }),

  /** Create a new invite */
  create: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      role: z.enum(["admin", "contract_manager", "finance_user", "member", "viewer"]).default("member"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const wsId = await requireWorkspaceId(ctx.user.id);
      const userRole = await getUserWorkspaceRole(ctx.user.id, wsId);

      // Only owner/admin can invite
      if (!canManageTeam(userRole)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only workspace owners and admins can invite members.",
        });
      }

      // Check if there's already a pending invite for this email
      const [existing] = await db
        .select()
        .from(invites)
        .where(and(
          eq(invites.workspaceId, wsId),
          eq(invites.email, input.email.toLowerCase()),
          eq(invites.status, "pending")
        ))
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A pending invite already exists for this email address.",
        });
      }

      // Check if user is already a member
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email.toLowerCase()))
        .limit(1);

      if (existingUser) {
        const [existingMember] = await db
          .select()
          .from(workspaceMembers)
          .where(and(
            eq(workspaceMembers.workspaceId, wsId),
            eq(workspaceMembers.userId, existingUser.id)
          ))
          .limit(1);

        if (existingMember) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This user is already a member of your workspace.",
          });
        }

        // Check if user is the workspace owner
        const [ws] = await db
          .select()
          .from(workspaces)
          .where(eq(workspaces.id, wsId))
          .limit(1);

        if (ws && ws.ownerId === existingUser.id) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This user is the workspace owner.",
          });
        }
      }

      const token = generateToken();
      const expiresAt = getExpiresAt();

      await db.insert(invites).values({
        workspaceId: wsId,
        email: input.email.toLowerCase(),
        role: input.role,
        invitedBy: ctx.user.id,
        token,
        status: "pending",
        expiresAt,
      });

      await logInviteAudit({
        workspaceId: wsId,
        userId: ctx.user.id,
        actionType: "invite_created",
        newValue: JSON.stringify({ email: input.email, role: input.role }),
      });

      return { success: true, token };
    }),

  /** Revoke a pending invite */
  revoke: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const wsId = await requireWorkspaceId(ctx.user.id);
      const userRole = await getUserWorkspaceRole(ctx.user.id, wsId);

      if (!canManageTeam(userRole)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only workspace owners and admins can revoke invites.",
        });
      }

      // Verify invite belongs to workspace
      const [invite] = await db
        .select()
        .from(invites)
        .where(and(eq(invites.id, input.id), eq(invites.workspaceId, wsId)))
        .limit(1);

      if (!invite) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invite not found." });
      }

      if (invite.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot revoke an invite with status: ${invite.status}`,
        });
      }

      await db
        .update(invites)
        .set({ status: "revoked", cancelledAt: new Date() })
        .where(eq(invites.id, input.id));

      await logInviteAudit({
        workspaceId: wsId,
        userId: ctx.user.id,
        actionType: "invite_revoked",
        targetId: input.id,
        newValue: JSON.stringify({ email: invite.email }),
      });

      return { success: true };
    }),

  /** Resend an invite (generates new token, resets expiry) */
  resend: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const wsId = await requireWorkspaceId(ctx.user.id);
      const userRole = await getUserWorkspaceRole(ctx.user.id, wsId);

      if (!canManageTeam(userRole)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only workspace owners and admins can resend invites.",
        });
      }

      // Verify invite belongs to workspace
      const [invite] = await db
        .select()
        .from(invites)
        .where(and(eq(invites.id, input.id), eq(invites.workspaceId, wsId)))
        .limit(1);

      if (!invite) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invite not found." });
      }

      if (invite.status !== "pending" && invite.status !== "expired") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot resend an invite with status: ${invite.status}`,
        });
      }

      const newToken = generateToken();
      const newExpiresAt = getExpiresAt();

      await db
        .update(invites)
        .set({ token: newToken, expiresAt: newExpiresAt, status: "pending" })
        .where(eq(invites.id, input.id));

      await logInviteAudit({
        workspaceId: wsId,
        userId: ctx.user.id,
        actionType: "invite_resent",
        targetId: input.id,
        newValue: JSON.stringify({ email: invite.email }),
      });

      return { success: true, token: newToken };
    }),

  /** Accept an invite — requires authenticated user */
  accept: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user.id;

      // Find invite by token
      const [invite] = await db
        .select()
        .from(invites)
        .where(and(eq(invites.token, input.token), eq(invites.status, "pending")))
        .limit(1);

      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid or expired invitation. Please request a new invite.",
        });
      }

      // Check expiry
      if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
        await db.update(invites).set({ status: "expired" }).where(eq(invites.id, invite.id));
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invitation has expired. Please request a new invite.",
        });
      }

      // Check if user is already a member
      const [existingMember] = await db
        .select()
        .from(workspaceMembers)
        .where(and(
          eq(workspaceMembers.workspaceId, invite.workspaceId),
          eq(workspaceMembers.userId, userId)
        ))
        .limit(1);

      if (existingMember) {
        // Mark invite as accepted anyway
        await db.update(invites).set({ status: "accepted", acceptedAt: new Date() }).where(eq(invites.id, invite.id));
        return { success: true, workspaceId: invite.workspaceId, alreadyMember: true };
      }

      // Check if user is workspace owner
      const [ws] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, invite.workspaceId))
        .limit(1);

      if (ws && ws.ownerId === userId) {
        await db.update(invites).set({ status: "accepted", acceptedAt: new Date() }).where(eq(invites.id, invite.id));
        return { success: true, workspaceId: invite.workspaceId, alreadyMember: true };
      }

      // Create workspace membership
      const memberRole = invite.role as "admin" | "contract_manager" | "finance_user" | "member" | "viewer";
      await db.insert(workspaceMembers).values({
        workspaceId: invite.workspaceId,
        userId,
        role: memberRole,
        invitedBy: invite.invitedBy,
      });

      // Mark invite as accepted
      await db.update(invites).set({ status: "accepted", acceptedAt: new Date() }).where(eq(invites.id, invite.id));

      await logInviteAudit({
        workspaceId: invite.workspaceId,
        userId,
        actionType: "invite_accepted",
        targetId: invite.id,
        newValue: JSON.stringify({ email: invite.email, role: invite.role }),
      });

      return { success: true, workspaceId: invite.workspaceId, alreadyMember: false };
    }),

  /** Validate an invite token (public — used by the accept page before auth) */
  validateToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();

      const [invite] = await db
        .select({
          id: invites.id,
          email: invites.email,
          role: invites.role,
          status: invites.status,
          expiresAt: invites.expiresAt,
          workspaceId: invites.workspaceId,
        })
        .from(invites)
        .where(eq(invites.token, input.token))
        .limit(1);

      if (!invite) {
        return { valid: false, reason: "not_found" as const };
      }

      if (invite.status !== "pending") {
        return { valid: false, reason: invite.status as "accepted" | "expired" | "revoked" };
      }

      if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
        return { valid: false, reason: "expired" as const };
      }

      // Get workspace name
      const [ws] = await db
        .select({ name: workspaces.name })
        .from(workspaces)
        .where(eq(workspaces.id, invite.workspaceId))
        .limit(1);

      return {
        valid: true,
        email: invite.email,
        role: invite.role,
        workspaceName: ws?.name || "Unknown Workspace",
      };
    }),
});

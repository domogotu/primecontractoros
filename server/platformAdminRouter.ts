import { adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import {
  workspaces,
  plans,
  platformBilling,
  supportTickets,
  users,
  loginEvents,
  platformNotes,
  platformAuditLog,
  workspaceMembers,
} from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

// ==================== PLATFORM ADMIN ROUTER ====================
// All procedures require admin role - customer users cannot access these

export const platformAdminRouter = router({
  // --- Workspaces Directory ---
  workspaces: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const allWorkspaces = await db
        .select()
        .from(workspaces)
        .orderBy(desc(workspaces.createdAt));
      // Enrich with owner info, user count, billing, support tickets
      const enriched = await Promise.all(
        allWorkspaces.map(async (ws) => {
          const [owner] = await db
            .select()
            .from(users)
            .where(eq(users.id, ws.ownerId))
            .limit(1);
          const members = await db
            .select()
            .from(workspaceMembers)
            .where(eq(workspaceMembers.workspaceId, ws.id));
          const [billing] = await db
            .select()
            .from(platformBilling)
            .where(eq(platformBilling.workspaceId, ws.id))
            .orderBy(desc(platformBilling.createdAt))
            .limit(1);
          const openTickets = await db
            .select()
            .from(supportTickets)
            .where(
              and(
                eq(supportTickets.workspaceId, ws.id),
                eq(supportTickets.status, "open")
              )
            );
          const [plan] = ws.planId
            ? await db
                .select()
                .from(plans)
                .where(eq(plans.id, ws.planId))
                .limit(1)
            : [null];
          return {
            ...ws,
            ownerName: owner?.name || "Unknown",
            ownerEmail: owner?.email || "Unknown",
            activeUserCount: members.length || 1,
            billingStatus: billing?.status || "none",
            planName: plan?.name || "No Plan",
            openSupportRequests: openTickets.length,
          };
        })
      );
      return enriched;
    }),

    get: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const [ws] = await db
          .select()
          .from(workspaces)
          .where(eq(workspaces.id, input.id))
          .limit(1);
        if (!ws) return null;
        // Get owner
        const [owner] = await db
          .select()
          .from(users)
          .where(eq(users.id, ws.ownerId))
          .limit(1);
        // Get all members/users in workspace
        const members = await db
          .select()
          .from(workspaceMembers)
          .where(eq(workspaceMembers.workspaceId, ws.id));
        const memberUsers =
          members.length > 0
            ? await Promise.all(
                members.map(async (m) => {
                  const [u] = await db
                    .select()
                    .from(users)
                    .where(eq(users.id, m.userId))
                    .limit(1);
                  return { ...m, user: u || null };
                })
              )
            : [];
        // Get billing history
        const billingHistory = await db
          .select()
          .from(platformBilling)
          .where(eq(platformBilling.workspaceId, ws.id))
          .orderBy(desc(platformBilling.createdAt));
        // Get plan
        const [plan] = ws.planId
          ? await db
              .select()
              .from(plans)
              .where(eq(plans.id, ws.planId))
              .limit(1)
          : [null];
        // Get support tickets
        const tickets = await db
          .select()
          .from(supportTickets)
          .where(eq(supportTickets.workspaceId, ws.id))
          .orderBy(desc(supportTickets.createdAt));
        // Get platform notes
        const notes = await db
          .select()
          .from(platformNotes)
          .where(eq(platformNotes.workspaceId, ws.id))
          .orderBy(desc(platformNotes.createdAt));
        // Get audit log
        const audit = await db
          .select()
          .from(platformAuditLog)
          .where(
            and(
              eq(platformAuditLog.targetType, "workspace"),
              eq(platformAuditLog.targetId, ws.id)
            )
          )
          .orderBy(desc(platformAuditLog.createdAt));
        // Get last login for workspace users
        const lastLogin = await db
          .select()
          .from(loginEvents)
          .where(eq(loginEvents.workspaceId, ws.id))
          .orderBy(desc(loginEvents.createdAt))
          .limit(1);
        return {
          ...ws,
          owner: owner || null,
          members: memberUsers,
          billingHistory,
          plan: plan || null,
          supportTickets: tickets,
          platformNotes: notes,
          auditLog: audit,
          lastLogin: lastLogin[0] || null,
        };
      }),

    suspend: adminProcedure
      .input(z.object({ id: z.number(), reason: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db
          .update(workspaces)
          .set({ status: "suspended" })
          .where(eq(workspaces.id, input.id));
        await db.insert(platformAuditLog).values({
          action: "suspend_workspace",
          targetType: "workspace",
          targetId: input.id,
          performedBy: ctx.user.id,
          reason: input.reason,
        });
        return { success: true };
      }),

    reactivate: adminProcedure
      .input(z.object({ id: z.number(), reason: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db
          .update(workspaces)
          .set({ status: "active" })
          .where(eq(workspaces.id, input.id));
        await db.insert(platformAuditLog).values({
          action: "reactivate_workspace",
          targetType: "workspace",
          targetId: input.id,
          performedBy: ctx.user.id,
          reason: input.reason,
        });
        return { success: true };
      }),
  }),

  // --- Users (admin view all) ---
  users: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const allUsers = await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt));
      // Enrich with workspace info and last login
      const enriched = await Promise.all(
        allUsers.map(async (u) => {
          const [ws] = await db
            .select()
            .from(workspaces)
            .where(eq(workspaces.ownerId, u.id))
            .limit(1);
          const [memberWs] = !ws
            ? await db
                .select()
                .from(workspaceMembers)
                .where(eq(workspaceMembers.userId, u.id))
                .limit(1)
            : [null];
          let workspaceName = ws?.companyName || ws?.name || null;
          let workspaceId = ws?.id || null;
          if (!ws && memberWs) {
            const [mWs] = await db
              .select()
              .from(workspaces)
              .where(eq(workspaces.id, memberWs.workspaceId))
              .limit(1);
            workspaceName = mWs?.companyName || mWs?.name || null;
            workspaceId = mWs?.id || null;
          }
          const [lastLoginEvent] = await db
            .select()
            .from(loginEvents)
            .where(eq(loginEvents.userId, u.id))
            .orderBy(desc(loginEvents.createdAt))
            .limit(1);
          const [wsForOnboarding] = ws
            ? [ws]
            : workspaceId
              ? await db
                  .select()
                  .from(workspaces)
                  .where(eq(workspaces.id, workspaceId))
                  .limit(1)
              : [null];
          return {
            ...u,
            workspaceName,
            workspaceId,
            lastLogin: lastLoginEvent?.createdAt || u.lastSignedIn,
            onboardingCompleted: wsForOnboarding?.onboardingCompleted || false,
          };
        })
      );
      return enriched;
    }),

    get: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, input.id))
          .limit(1);
        if (!user) return null;
        const [ws] = await db
          .select()
          .from(workspaces)
          .where(eq(workspaces.ownerId, user.id))
          .limit(1);
        const loginHistory = await db
          .select()
          .from(loginEvents)
          .where(eq(loginEvents.userId, user.id))
          .orderBy(desc(loginEvents.createdAt))
          .limit(50);
        return { ...user, workspace: ws || null, loginHistory };
      }),

    disable: adminProcedure
      .input(z.object({ id: z.number(), reason: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db
          .update(users)
          .set({ accountStatus: "disabled" })
          .where(eq(users.id, input.id));
        await db.insert(platformAuditLog).values({
          action: "disable_user",
          targetType: "user",
          targetId: input.id,
          performedBy: ctx.user.id,
          reason: input.reason,
        });
        return { success: true };
      }),

    enable: adminProcedure
      .input(z.object({ id: z.number(), reason: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db
          .update(users)
          .set({ accountStatus: "active" })
          .where(eq(users.id, input.id));
        await db.insert(platformAuditLog).values({
          action: "enable_user",
          targetType: "user",
          targetId: input.id,
          performedBy: ctx.user.id,
          reason: input.reason,
        });
        return { success: true };
      }),
  }),

  // --- Login Events / Activity ---
  activity: router({
    list: adminProcedure
      .input(
        z
          .object({
            limit: z.number().min(1).max(500).default(100),
            offset: z.number().min(0).default(0),
            userId: z.number().optional(),
            workspaceId: z.number().optional(),
            eventType: z.string().optional(),
            suspiciousOnly: z.boolean().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const limit = input?.limit || 100;
        const offset = input?.offset || 0;
        let events = await db
          .select()
          .from(loginEvents)
          .orderBy(desc(loginEvents.createdAt))
          .limit(limit)
          .offset(offset);
        // Apply filters in memory (simple approach for now)
        if (input?.userId) {
          events = events.filter((e) => e.userId === input.userId);
        }
        if (input?.workspaceId) {
          events = events.filter((e) => e.workspaceId === input.workspaceId);
        }
        if (input?.suspiciousOnly) {
          events = events.filter((e) => e.suspiciousFlag);
        }
        // Enrich with user/workspace names
        const enriched = await Promise.all(
          events.map(async (evt) => {
            let userName = null;
            let workspaceName = null;
            if (evt.userId) {
              const [u] = await db
                .select()
                .from(users)
                .where(eq(users.id, evt.userId))
                .limit(1);
              userName = u?.name || null;
            }
            if (evt.workspaceId) {
              const [ws] = await db
                .select()
                .from(workspaces)
                .where(eq(workspaces.id, evt.workspaceId))
                .limit(1);
              workspaceName = ws?.companyName || ws?.name || null;
            }
            return { ...evt, userName, workspaceName };
          })
        );
        return enriched;
      }),

    stats: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { total: 0, failures: 0, suspicious: 0 };
      const allEvents = await db.select().from(loginEvents);
      const failures = allEvents.filter((e) => !e.success);
      const suspicious = allEvents.filter((e) => e.suspiciousFlag);
      return {
        total: allEvents.length,
        failures: failures.length,
        suspicious: suspicious.length,
      };
    }),
  }),

  // --- Platform Notes ---
  notes: router({
    create: adminProcedure
      .input(
        z.object({
          workspaceId: z.number().optional(),
          userId: z.number().optional(),
          note: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.insert(platformNotes).values({
          workspaceId: input.workspaceId || null,
          userId: input.userId || null,
          note: input.note,
          createdBy: ctx.user.id,
        });
        await db.insert(platformAuditLog).values({
          action: "add_note",
          targetType: input.workspaceId ? "workspace" : "user",
          targetId: input.workspaceId || input.userId || 0,
          performedBy: ctx.user.id,
          reason: "Platform note added",
        });
        return { success: true };
      }),

    list: adminProcedure
      .input(
        z
          .object({
            workspaceId: z.number().optional(),
            userId: z.number().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        if (input?.workspaceId) {
          return db
            .select()
            .from(platformNotes)
            .where(eq(platformNotes.workspaceId, input.workspaceId))
            .orderBy(desc(platformNotes.createdAt));
        }
        if (input?.userId) {
          return db
            .select()
            .from(platformNotes)
            .where(eq(platformNotes.userId, input.userId))
            .orderBy(desc(platformNotes.createdAt));
        }
        return db
          .select()
          .from(platformNotes)
          .orderBy(desc(platformNotes.createdAt))
          .limit(50);
      }),
  }),

  // --- Audit Log ---
  audit: router({
    list: adminProcedure
      .input(
        z
          .object({
            targetType: z.string().optional(),
            targetId: z.number().optional(),
            limit: z.number().min(1).max(200).default(50),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const limit = input?.limit || 50;
        if (input?.targetType && input?.targetId) {
          return db
            .select()
            .from(platformAuditLog)
            .where(
              and(
                eq(
                  platformAuditLog.targetType,
                  input.targetType as any
                ),
                eq(platformAuditLog.targetId, input.targetId)
              )
            )
            .orderBy(desc(platformAuditLog.createdAt))
            .limit(limit);
        }
        return db
          .select()
          .from(platformAuditLog)
          .orderBy(desc(platformAuditLog.createdAt))
          .limit(limit);
      }),
  }),
});

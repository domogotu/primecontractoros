import { adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { Resend } from "resend";
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
  consentRecords,
  workspaceHealthFlags,
  platformActivityLog,
  subscriptions,
  tasks,
  contracts,
  proposals,
  opportunities,
  invoices,
} from "../drizzle/schema";
import { eq, desc, and, count, sql, gte } from "drizzle-orm";

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

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        companyName: z.string().optional(),
        contractingModel: z.enum(["prime", "sub", "both"]).optional(),
        onboardingCompleted: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { id, ...fields } = input;
        const updateFields: Record<string, unknown> = {};
        if (fields.companyName !== undefined) updateFields.companyName = fields.companyName;
        if (fields.contractingModel !== undefined) updateFields.contractingModel = fields.contractingModel;
        if (fields.onboardingCompleted !== undefined) updateFields.onboardingCompleted = fields.onboardingCompleted;
        await db.update(workspaces).set(updateFields).where(eq(workspaces.id, id));
        await db.insert(platformAuditLog).values({
          action: "update_workspace",
          targetType: "workspace",
          targetId: id,
          performedBy: ctx.user.id,
          reason: `Updated: ${Object.keys(updateFields).join(", ")}`,
        });
        return { success: true };
      }),

  }),

  // --- Send Welcome Email (top-level for type inference) ---
  sendWelcomeEmail: adminProcedure
    .input(z.object({ workspaceId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, input.workspaceId)).limit(1);
      if (!ws) throw new Error("Workspace not found");
      const [owner] = await db.select().from(users).where(eq(users.id, ws.ownerId)).limit(1);
      if (!owner?.email) throw new Error("Workspace owner has no email");
      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) throw new Error("RESEND_API_KEY not configured");
      const resend = new Resend(resendKey);
      const name = owner.name || "Team Member";
      const wsName = ws.companyName || ws.name || "your workspace";
      const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Welcome to PrimeContractorOS</title></head>
<body style="margin:0;padding:0;background:#0b1320;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1320;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111d30;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
        <tr><td style="background:linear-gradient(135deg,#1a2d4a,#0b1320);padding:40px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.1);">
          <h1 style="color:#fff;font-size:24px;margin:0 0 8px;">Welcome to Reed's Solutions LLC</h1>
          <p style="color:#60a5fa;font-size:14px;margin:0;">PrimeContractorOS — Government Contracting Management Platform</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="color:#e2e8f0;font-size:16px;margin:0 0 20px;">Hi ${name},</p>
          <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
            Your workspace <strong style="color:#e2e8f0;">${wsName}</strong> is ready on PrimeContractorOS. Log in to start managing your government contracting operations.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr><td style="padding:20px;background:rgba(59,130,246,0.1);border-radius:8px;border:1px solid rgba(59,130,246,0.2);">
              <p style="color:#60a5fa;font-size:13px;font-weight:bold;margin:0 0 12px;">Get Started Now</p>
              <a href="https://primecontractor-bk79t4ta.manus.space/login" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:bold;">Log In to PrimeContractorOS</a>
            </td></tr>
          </table>
          <p style="color:#64748b;font-size:12px;margin:24px 0 0;border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;">
            Questions? Contact us at <a href="mailto:support@reedssolutionsllc.org" style="color:#60a5fa;">support@reedssolutionsllc.org</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
      const result = await resend.emails.send({
        from: "Reed's Solutions LLC <onboarding@resend.dev>",
        to: owner.email,
        subject: `Welcome to PrimeContractorOS — ${wsName} is Ready`,
        html: htmlBody,
      });
      if (result.error) throw new Error(`Failed to send email: ${result.error.message}`);
      return { success: true, emailId: result.data?.id };
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

  // --- Onboarding Email ---
  onboarding: router({
    sendLink: adminProcedure
      .input(
        z.object({
          recipientEmail: z.string().email(),
          recipientName: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const resendKey = process.env.RESEND_API_KEY;
        if (!resendKey) throw new Error("RESEND_API_KEY not configured");
        const resend = new Resend(resendKey);
        const name = input.recipientName || "Team Member";
        const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Welcome to Reed's Solutions LLC</title></head>
<body style="margin:0;padding:0;background:#0b1320;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1320;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111d30;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
        <tr><td style="background:linear-gradient(135deg,#1a2d4a,#0b1320);padding:40px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.1);">
          <h1 style="color:#fff;font-size:24px;margin:0 0 8px;">Welcome to Reed's Solutions LLC</h1>
          <p style="color:#60a5fa;font-size:14px;margin:0;">PrimeContractorOS — Government Contracting Management Platform</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="color:#e2e8f0;font-size:16px;margin:0 0 20px;">Hi ${name},</p>
          <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
            Welcome to the team! You now have access to PrimeContractorOS. This platform helps you manage opportunities, proposals, contracts, compliance, and more.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr><td style="padding:20px;background:rgba(59,130,246,0.1);border-radius:8px;border:1px solid rgba(59,130,246,0.2);">
              <p style="color:#60a5fa;font-size:13px;font-weight:bold;margin:0 0 8px;">Step 1: Read the Onboarding Guide</p>
              <a href="https://reedssolutionsllc.org/onboarding" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:bold;">View Onboarding Guide</a>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr><td style="padding:20px;background:rgba(70,210,126,0.08);border-radius:8px;border:1px solid rgba(70,210,126,0.2);">
              <p style="color:#46d27e;font-size:13px;font-weight:bold;margin:0 0 8px;">Step 2: Log In to PrimeContractorOS</p>
              <a href="https://primecontractor-bk79t4ta.manus.space/login" style="display:inline-block;background:#46d27e;color:#0b1320;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:bold;">Go to PrimeContractorOS</a>
            </td></tr>
          </table>
          <p style="color:#64748b;font-size:12px;margin:24px 0 0;border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;">
            Questions? Contact us at <a href="mailto:support@reedssolutionsllc.org" style="color:#60a5fa;">support@reedssolutionsllc.org</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
        const result = await resend.emails.send({
          from: "Reed's Solutions LLC <onboarding@resend.dev>",
          to: input.recipientEmail,
          subject: "Welcome to Reed's Solutions LLC — Your Onboarding Guide",
          html: htmlBody,
        });
        if (result.error) throw new Error(`Failed to send email: ${result.error.message}`);
        return { success: true, emailId: result.data?.id };
      }),
  }),

  // --- Consent Records ---
  consentRecords: router({
    // Paginated list of all consent records across all users
    list: adminProcedure
      .input(z.object({
        offset: z.number().default(0),
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { records: [], total: 0 };
        const [records, totalResult] = await Promise.all([
          db.select().from(consentRecords)
            .orderBy(desc(consentRecords.acceptedAt))
            .limit(input.limit)
            .offset(input.offset),
          db.select({ count: count() }).from(consentRecords),
        ]);
        return { records, total: totalResult[0]?.count ?? 0 };
      }),

    // Aggregate stats: total, accepted, declined, by policy version
    stats: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { total: 0, accepted: 0, declined: 0, byVersion: [] };
      const all = await db.select({
        action: consentRecords.action,
        policyVersion: consentRecords.policyVersion,
        cnt: count(),
      }).from(consentRecords)
        .groupBy(consentRecords.action, consentRecords.policyVersion);

      let total = 0, accepted = 0, declined = 0;
      const versionMap: Record<string, { accepted: number; declined: number }> = {};

      for (const row of all) {
        const n = Number(row.cnt);
        total += n;
        if (row.action === 'accepted') accepted += n;
        else declined += n;
        const v = row.policyVersion ?? 'unknown';
        if (!versionMap[v]) versionMap[v] = { accepted: 0, declined: 0 };
        if (row.action === 'accepted') versionMap[v].accepted += n;
        else versionMap[v].declined += n;
      }

      const byVersion = Object.entries(versionMap).map(([version, counts]) => ({ version, ...counts }));
      return { total, accepted, declined, byVersion };
    }),
  }),

  // --- Workspace Health Flags ---
  healthFlags: router({
    list: adminProcedure
      .input(z.object({
        workspaceId: z.number().optional(),
        activeOnly: z.boolean().optional(),
        severity: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        let flags = await db.select().from(workspaceHealthFlags)
          .orderBy(desc(workspaceHealthFlags.createdAt));
        if (input?.workspaceId) flags = flags.filter(f => f.workspaceId === input.workspaceId);
        if (input?.activeOnly !== false) flags = flags.filter(f => f.isActive);
        if (input?.severity && input.severity !== "all") flags = flags.filter(f => f.severity === input.severity);
        return flags;
      }),

    create: adminProcedure
      .input(z.object({
        workspaceId: z.number(),
        flagType: z.string(),
        severity: z.enum(["info", "warning", "critical"]),
        title: z.string(),
        description: z.string().optional(),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const [result] = await db.insert(workspaceHealthFlags).values({
          workspaceId: input.workspaceId,
          flagType: input.flagType,
          severity: input.severity,
          title: input.title,
          description: input.description || null,
          metadata: input.metadata || null,
        });
        return { id: result.insertId };
      }),

    resolve: adminProcedure
      .input(z.object({
        id: z.number(),
        resolutionNote: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.update(workspaceHealthFlags).set({
          isActive: false,
          resolvedAt: new Date(),
          resolvedBy: ctx.user.id,
          resolutionNote: input.resolutionNote || null,
        }).where(eq(workspaceHealthFlags.id, input.id));
        return { success: true };
      }),
  }),

  // --- Platform Activity Log ---
  activityLog: router({
    list: adminProcedure
      .input(z.object({
        workspaceId: z.number().optional(),
        activityType: z.string().optional(),
        limit: z.number().default(100),
      }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        let entries = await db.select().from(platformActivityLog)
          .orderBy(desc(platformActivityLog.createdAt))
          .limit(input?.limit || 100);
        if (input?.workspaceId) entries = entries.filter(e => e.workspaceId === input.workspaceId);
        if (input?.activityType && input.activityType !== "all") entries = entries.filter(e => e.activityType === input.activityType);
        return entries;
      }),

    create: adminProcedure
      .input(z.object({
        workspaceId: z.number().optional(),
        userId: z.number().optional(),
        activityType: z.string(),
        title: z.string(),
        description: z.string().optional(),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const [result] = await db.insert(platformActivityLog).values({
          workspaceId: input.workspaceId || null,
          userId: input.userId || null,
          activityType: input.activityType,
          title: input.title,
          description: input.description || null,
          metadata: input.metadata || null,
        });
        return { id: result.insertId };
      }),
  }),

  // --- Dashboard Metrics ---
  dashboardMetrics: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return {
      totalWorkspaces: 0, activeWorkspaces: 0, suspendedWorkspaces: 0,
      totalUsers: 0, activeUsers: 0, disabledUsers: 0,
      totalRevenue: 0, openTickets: 0, criticalFlags: 0,
      newWorkspacesThisMonth: 0, newUsersThisMonth: 0,
      trialWorkspaces: 0, paidWorkspaces: 0,
    };
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const allWorkspaces = await db.select().from(workspaces);
    const allUsers = await db.select().from(users);
    const allBilling = await db.select().from(platformBilling);
    const allTickets = await db.select().from(supportTickets);
    const allFlags = await db.select().from(workspaceHealthFlags).where(eq(workspaceHealthFlags.isActive, true));

    const activeWorkspaces = allWorkspaces.filter(w => w.status === "active");
    const suspendedWorkspaces = allWorkspaces.filter(w => w.status === "suspended");
    const activeUsers = allUsers.filter(u => u.accountStatus === "active");
    const disabledUsers = allUsers.filter(u => u.accountStatus === "disabled" || u.accountStatus === "suspended");
    const openTickets = allTickets.filter(t => t.status === "open");
    const criticalFlags = allFlags.filter(f => f.severity === "critical");
    const newWorkspacesThisMonth = allWorkspaces.filter(w => w.createdAt && new Date(w.createdAt) >= thirtyDaysAgo);
    const newUsersThisMonth = allUsers.filter(u => u.createdAt && new Date(u.createdAt) >= thirtyDaysAgo);
    const trialWorkspaces = allWorkspaces.filter(w => w.trialUsed && !w.planId);
    const paidWorkspaces = allWorkspaces.filter(w => w.planId);
    const totalRevenue = allBilling.filter(b => b.status === "active").length * 99; // Estimated from active subscriptions

    return {
      totalWorkspaces: allWorkspaces.length,
      activeWorkspaces: activeWorkspaces.length,
      suspendedWorkspaces: suspendedWorkspaces.length,
      totalUsers: allUsers.length,
      activeUsers: activeUsers.length,
      disabledUsers: disabledUsers.length,
      totalRevenue,
      openTickets: openTickets.length,
      criticalFlags: criticalFlags.length,
      newWorkspacesThisMonth: newWorkspacesThisMonth.length,
      newUsersThisMonth: newUsersThisMonth.length,
      trialWorkspaces: trialWorkspaces.length,
      paidWorkspaces: paidWorkspaces.length,
    };
  }),

  // --- Workspace Usage/Product Activity (per workspace) ---
  workspaceUsage: adminProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { contracts: 0, proposals: 0, opportunities: 0, invoices: 0, tasks: 0, users: 0 };
      const [contractCount] = await db.select({ count: count() }).from(contracts).where(eq(contracts.workspaceId, input.workspaceId));
      const [proposalCount] = await db.select({ count: count() }).from(proposals).where(eq(proposals.workspaceId, input.workspaceId));
      const [oppCount] = await db.select({ count: count() }).from(opportunities).where(eq(opportunities.workspaceId, input.workspaceId));
      const [invoiceCount] = await db.select({ count: count() }).from(invoices).where(eq(invoices.workspaceId, input.workspaceId));
      const [taskCount] = await db.select({ count: count() }).from(tasks).where(eq(tasks.workspaceId, input.workspaceId));
      const memberCount = await db.select().from(workspaceMembers).where(eq(workspaceMembers.workspaceId, input.workspaceId));
      return {
        contracts: Number(contractCount?.count || 0),
        proposals: Number(proposalCount?.count || 0),
        opportunities: Number(oppCount?.count || 0),
        invoices: Number(invoiceCount?.count || 0),
        tasks: Number(taskCount?.count || 0),
        users: memberCount.length + 1, // +1 for owner
      };
    }),

  // --- Admin Overrides/Recovery ---
  overrides: router({
    resetOnboarding: adminProcedure
      .input(z.object({ workspaceId: z.number(), reason: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.update(workspaces).set({ onboardingCompleted: false }).where(eq(workspaces.id, input.workspaceId));
        await db.insert(platformAuditLog).values({
          action: "reset_onboarding",
          targetType: "workspace",
          targetId: input.workspaceId,
          performedBy: ctx.user.id,
          reason: input.reason,
        });
        return { success: true };
      }),

    changePlan: adminProcedure
      .input(z.object({ workspaceId: z.number(), planId: z.number().nullable(), reason: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.update(workspaces).set({ planId: input.planId }).where(eq(workspaces.id, input.workspaceId));
        await db.insert(platformAuditLog).values({
          action: "change_plan",
          targetType: "workspace",
          targetId: input.workspaceId,
          performedBy: ctx.user.id,
          reason: input.reason,
        });
        return { success: true };
      }),

    transferOwnership: adminProcedure
      .input(z.object({ workspaceId: z.number(), newOwnerId: z.number(), reason: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.update(workspaces).set({ ownerId: input.newOwnerId }).where(eq(workspaces.id, input.workspaceId));
        await db.insert(platformAuditLog).values({
          action: "transfer_ownership",
          targetType: "workspace",
          targetId: input.workspaceId,
          performedBy: ctx.user.id,
          reason: input.reason,
        });
        return { success: true };
      }),

    resetTrial: adminProcedure
      .input(z.object({ workspaceId: z.number(), reason: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.update(workspaces).set({ trialUsed: false }).where(eq(workspaces.id, input.workspaceId));
        await db.insert(platformAuditLog).values({
          action: "reset_trial",
          targetType: "workspace",
          targetId: input.workspaceId,
          performedBy: ctx.user.id,
          reason: input.reason,
        });
        return { success: true };
      }),
  }),
});
